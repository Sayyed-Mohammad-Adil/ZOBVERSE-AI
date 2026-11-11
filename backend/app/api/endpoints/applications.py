from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.application import Application
from app.models.job import Job
from app.models.profile import CandidateProfile
from app.models.resume import Resume
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.applications.prepare import ApplicationPreparer
from app.adapters.registry import ALL_SOURCE_NAMES
from typing import Any, List
from datetime import datetime

router = APIRouter()
preparer = ApplicationPreparer()

@router.get("/{user_id}", response_model=List[ApplicationResponse])
async def list_applications(user_id: int, db: AsyncSession = Depends(get_db)) -> Any:
    result = await db.execute(
        select(Application, Job)
        .outerjoin(Job, Application.job_id == Job.id)
        .where(Application.user_id == user_id)
        .order_by(Application.created_at.desc())
    )
    rows = result.all()
    response_list = []
    for app, job in rows:
        app_dict = {
            "id": app.id,
            "user_id": app.user_id,
            "job_id": app.job_id,
            "resume_id": app.resume_id,
            "status": app.status,
            "notes": app.notes,
            "applied_at": app.applied_at,
            "created_at": app.created_at,
            "updated_at": app.updated_at,
            "history": app.history,
            "job_title": job.title if job else None,
            "job_company": job.company if job else None,
            "job_location": job.location if job else None,
            "job_source": job.source if job else None,
            "job_application_url": (
                (job.application_url or job.canonical_url) if job else None
            ),
        }
        response_list.append(app_dict)
    return response_list

@router.put("/{app_id}", response_model=ApplicationResponse)
async def update_application(app_id: int, app_update: ApplicationUpdate, db: AsyncSession = Depends(get_db)) -> Any:
    if app_update.status == "APPLIED" and not app_update.submission_confirmed:
        raise HTTPException(
            status_code=422,
            detail="Confirm submission on the official platform before marking this application as applied.",
        )

    result = await db.execute(select(Application).where(Application.id == app_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if app_update.status:
        app.status = app_update.status
        if app_update.status == "APPLIED" and not app.applied_at:
            app.applied_at = datetime.utcnow()
        # Append to status history
        history = list(app.history) if isinstance(app.history, list) else []
        history.append({
            "status": app_update.status,
            "timestamp": datetime.utcnow().isoformat(),
            "notes": app_update.notes
        })
        app.history = history

    if app_update.notes is not None:
        app.notes = app_update.notes

    app.updated_at = datetime.utcnow()
    db.add(app)
    await db.commit()
    await db.refresh(app)
    
    # Fetch job info for response
    job_res = await db.execute(select(Job).where(Job.id == app.job_id))
    job = job_res.scalars().first()
    
    return {
        "id": app.id,
        "user_id": app.user_id,
        "job_id": app.job_id,
        "resume_id": app.resume_id,
        "status": app.status,
        "notes": app.notes,
        "applied_at": app.applied_at,
        "created_at": app.created_at,
        "updated_at": app.updated_at,
        "history": app.history,
        "job_title": job.title if job else None,
        "job_company": job.company if job else None,
        "job_location": job.location if job else None,
        "job_source": job.source if job else None,
        "job_application_url": job.application_url or job.canonical_url if job else None,
    }

@router.post("/prepare")
async def prepare_application_endpoint(job_id: int, user_id: int, db: AsyncSession = Depends(get_db)) -> Any:
    # 1. Fetch Job
    job_res = await db.execute(select(Job).where(Job.id == job_id))
    job = job_res.scalars().first()
    if (
        not job
        or job.source.lower() not in ALL_SOURCE_NAMES
        or job.external_job_id.lower().startswith("dummy_")
    ):
        raise HTTPException(status_code=404, detail="Job not found")

    # 2. Fetch Profile
    prof_res = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user_id))
    profile = prof_res.scalars().first()
    if not profile:
        raise HTTPException(
            status_code=400,
            detail="Create and complete a candidate profile before preparing an application.",
        )

    # 3. Fetch default resume if available
    res_res = await db.execute(select(Resume).where(Resume.user_id == user_id, Resume.is_default == True))
    default_resume = res_res.scalars().first()
    if not default_resume:
        res_res = await db.execute(select(Resume).where(Resume.user_id == user_id))
        default_resume = res_res.scalars().first()

    # 4. Prepare application package (cover letter, answers)
    prep_data = await preparer.prepare_application(profile, job)

    # 5. Check if application already exists
    app_res = await db.execute(select(Application).where(Application.user_id == user_id, Application.job_id == job_id))
    existing = app_res.scalars().first()
    if existing:
        existing.notes = prep_data.get("cover_letter")
        existing.resume_id = default_resume.id if default_resume else None
        db.add(existing)
        await db.commit()
        await db.refresh(existing)
        target_app = existing
    else:
        new_app = Application(
            user_id=user_id,
            job_id=job_id,
            resume_id=default_resume.id if default_resume else None,
            status="READY",
            notes=prep_data.get("cover_letter"),
            history=[{"status": "READY", "timestamp": datetime.utcnow().isoformat(), "event": "Application prepared"}]
        )
        db.add(new_app)
        await db.commit()
        await db.refresh(new_app)
        target_app = new_app

    return {
        "message": "Application package prepared; no submission was made.",
        "application_id": target_app.id,
        "job_title": job.title,
        "company": job.company,
        "source": job.source,
        "application_url": job.application_url or job.canonical_url,
        "submission_status": "REQUIRES_CANDIDATE_ACTION",
        "cover_letter": prep_data.get("cover_letter"),
        "confidence": prep_data.get("confidence", 0.95),
        "status": target_app.status
    }

@router.post("/", response_model=ApplicationResponse)
async def create_application(user_id: int, app_in: ApplicationCreate, db: AsyncSession = Depends(get_db)) -> Any:
    if app_in.status == "APPLIED":
        raise HTTPException(
            status_code=422,
            detail="Applications must be confirmed on the official platform before marking them as applied.",
        )

    # Check duplicate application per Rule 2: Never apply twice to the same job
    result = await db.execute(
        select(Application).where(Application.user_id == user_id, Application.job_id == app_in.job_id)
    )
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Application already exists for this job. Duplicate application prohibited.")
        
    application = Application(
        user_id=user_id,
        **app_in.model_dump(),
        history=[{"status": app_in.status or "READY", "timestamp": datetime.utcnow().isoformat()}]
    )
    db.add(application)
    await db.commit()
@router.post("/import-csv")
async def import_applications_csv(user_id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)) -> Any:
    """Imports candidate's prior application history from CSV to prevent duplicate applications"""
    import csv
    import io
    from app.models.audit_log import AuditLog

    content = await file.read()
    decoded = content.decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(decoded))

    imported_count = 0
    skipped_duplicates = 0

    for row in reader:
        company = (row.get("company") or row.get("Company") or "").strip()
        role = (row.get("role") or row.get("Role") or row.get("title") or row.get("Title") or "").strip()
        url = (row.get("url") or row.get("URL") or row.get("link") or "").strip()
        status_val = (row.get("status") or row.get("Status") or "APPLIED").strip().upper()
        notes = (row.get("notes") or row.get("Notes") or f"Imported via CSV: {company} - {role}").strip()

        if not company or not role:
            continue

        # Check if job already exists or create an external job record
        job_res = await db.execute(select(Job).where(Job.company == company, Job.title == role))
        job = job_res.scalars().first()
        if not job:
            job = Job(
                source="CSV_IMPORT",
                external_job_id=f"csv_{company.lower().replace(' ', '_')}_{hash(role) % 100000}",
                canonical_url=url,
                company=company,
                title=role,
                location=row.get("location", "Unknown"),
                description=f"Job record imported from user's application history for {company} - {role}.",
                status="APPLIED"
            )
            db.add(job)
            await db.flush()

        # Check if user already has an application record for this job
        app_res = await db.execute(
            select(Application).where(Application.user_id == user_id, Application.job_id == job.id)
        )
        existing_app = app_res.scalars().first()
        if existing_app:
            skipped_duplicates += 1
            continue

        app = Application(
            user_id=user_id,
            job_id=job.id,
            status=status_val,
            applied_at=datetime.utcnow(),
            notes=notes,
            history=[{"status": status_val, "timestamp": datetime.utcnow().isoformat(), "source": "CSV Import"}]
        )
        db.add(app)
        imported_count += 1

    audit = AuditLog(
        user_id=user_id,
        action="IMPORT_APPLICATIONS_CSV",
        service="application_manager",
        details=f"Imported {imported_count} applications from CSV ({skipped_duplicates} duplicates skipped)."
    )
    db.add(audit)

    await db.commit()
    return {
        "success": True,
        "imported": imported_count,
        "skipped_duplicates": skipped_duplicates,
        "message": f"Successfully imported {imported_count} applications."
    }
