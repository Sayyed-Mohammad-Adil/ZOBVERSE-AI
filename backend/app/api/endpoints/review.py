from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.models.job import Job
from app.models.application import Application
from app.models.preferences import CandidatePreferences
from app.models.profile import CandidateProfile
from app.models.audit_log import AuditLog
from app.matching.engine import MatchingEngine

router = APIRouter()

class ReviewItem(BaseModel):
    id: str
    job_id: int
    application_id: Optional[int] = None
    type: str  # ACTION_REQUIRED, UNKNOWN_SALARY, READY_FOR_APPROVAL, MANUAL_CONFIRMATION
    title: str
    reason: str
    company: str
    job_title: str
    location: Optional[str]
    source: str
    url: Optional[str]
    match_score: Optional[int] = None
    created_at: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class ResolveReviewRequest(BaseModel):
    review_item_id: str
    job_id: int
    user_id: int
    action: str  # "APPROVE", "EDIT", "SKIP", "CANCEL"
    notes: Optional[str] = None
    updated_salary: Optional[float] = None

@router.get("/{user_id}", response_model=List[ReviewItem])
async def get_review_queue(user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns authentic items requiring human-in-the-loop review for this specific user:
    1. Real applications in REVIEW, ACTION_REQUIRED, or READY state
    2. Real match scores calculated against the candidate profile
    """
    items: List[ReviewItem] = []

    # Load candidate profile and preferences for real match scoring
    prof_res = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user_id))
    profile = prof_res.scalars().first()

    pref_res = await db.execute(select(CandidatePreferences).where(CandidatePreferences.user_id == user_id))
    preferences = pref_res.scalars().first()

    matching_engine = MatchingEngine()

    # Query real applications for this user requiring review or approval
    app_res = await db.execute(
        select(Application, Job)
        .join(Job, Application.job_id == Job.id)
        .where(
            Application.user_id == user_id,
            Application.status.in_(["REVIEW", "ACTION_REQUIRED", "READY"])
        )
        .order_by(Application.created_at.desc())
    )
    apps = app_res.all()

    for app, job in apps:
        rev_type = "ACTION_REQUIRED" if app.status == "ACTION_REQUIRED" else ("READY_FOR_APPROVAL" if app.status == "READY" else "MANUAL_CONFIRMATION")
        reason = "Application prepared by AI agent awaiting your 1-click authorization to submit."
        
        if job.source.lower() != "linkedin":
            reason = "External company application platform: automation paused to comply with platform rules. Manual confirmation required."
        elif not job.salary_min and not job.salary_max:
            rev_type = "UNKNOWN_SALARY"
            reason = "Job listing does not disclose compensation. Please verify role requirements before submission."

        # Calculate actual deterministic match score if profile exists
        calculated_match = None
        if profile and profile.skills:
            try:
                match_data = await matching_engine.calculate_match(profile, preferences, job)
                calculated_match = match_data.get("total_match_score")
            except Exception:
                calculated_match = None

        items.append(ReviewItem(
            id=f"app_{app.id}",
            job_id=job.id,
            application_id=app.id,
            type=rev_type,
            title=f"Review Required: {job.title} at {job.company}",
            reason=reason,
            company=job.company,
            job_title=job.title,
            location=job.location,
            source=job.source,
            url=job.application_url or job.canonical_url,
            match_score=calculated_match,
            created_at=app.created_at.isoformat() if app.created_at else None,
            details={"status": app.status, "notes": app.notes}
        ))

    return items

@router.post("/resolve")
async def resolve_review_item(req: ResolveReviewRequest, db: AsyncSession = Depends(get_db)):
    """Handles Approve, Edit, Skip, or Cancel for review queue items"""
    job_res = await db.execute(select(Job).where(Job.id == req.job_id))
    job = job_res.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if req.action == "APPROVE":
        app_res = await db.execute(
            select(Application).where(Application.job_id == req.job_id, Application.user_id == req.user_id)
        )
        app = app_res.scalar_one_or_none()
        if app:
            app.status = "APPLIED"
            if not app.history:
                app.history = []
            app.history = list(app.history) + [{"status": "APPLIED", "action": "Approved by user in review queue"}]
        else:
            app = Application(
                job_id=req.job_id,
                user_id=req.user_id,
                status="APPLIED",
                notes=req.notes or "Manually approved and submitted via review queue"
            )
            db.add(app)
        
        job.status = "APPLIED"

        audit = AuditLog(
            user_id=req.user_id,
            action="APPROVE_REVIEW",
            service="review_queue",
            details=f"Approved application for {job.title} at {job.company}"
        )
        db.add(audit)

    elif req.action == "SKIP":
        job.status = "SKIPPED"
        app_res = await db.execute(
            select(Application).where(Application.job_id == req.job_id, Application.user_id == req.user_id)
        )
        app = app_res.scalar_one_or_none()
        if app:
            app.status = "SKIPPED"

        audit = AuditLog(
            user_id=req.user_id,
            action="SKIP_REVIEW",
            service="review_queue",
            details=f"Skipped {job.title} at {job.company}: {req.notes or 'User skipped via review queue'}"
        )
        db.add(audit)

    elif req.action == "EDIT" and req.updated_salary:
        job.salary_min = req.updated_salary
        job.salary_max = req.updated_salary

    await db.commit()
    return {"message": f"Review action '{req.action}' processed successfully"}
