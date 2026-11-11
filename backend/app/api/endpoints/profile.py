from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.profile import CandidateProfile
from app.models.resume import Resume
from app.schemas.profile import CandidateProfileCreate, CandidateProfileUpdate, CandidateProfileResponse
from app.resume.parser import ResumeParser
from app.resume.parser import light_ocr
from app.core.config import settings
from typing import Any, Dict
import os
import shutil

router = APIRouter()
parser = ResumeParser()

os.makedirs(settings.STORAGE_PATH, exist_ok=True)

@router.get("/{user_id}", response_model=CandidateProfileResponse)
async def get_profile(user_id: int, db: AsyncSession = Depends(get_db)) -> Any:
    result = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user_id))
    profile = result.scalars().first()
    if not profile:
        # Create an empty profile stub so user can edit right away
        profile = CandidateProfile(user_id=user_id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile

@router.put("/{user_id}", response_model=CandidateProfileResponse)
@router.post("/{user_id}", response_model=CandidateProfileResponse)
async def upsert_profile(user_id: int, profile_in: CandidateProfileUpdate, db: AsyncSession = Depends(get_db)) -> Any:
    result = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user_id))
    profile = result.scalars().first()
    
    update_data = profile_in.model_dump(exclude_unset=True)
    if profile:
        for field, value in update_data.items():
            setattr(profile, field, value)
    else:
        profile = CandidateProfile(user_id=user_id, **update_data)
        db.add(profile)

    await db.commit()
    await db.refresh(profile)
    return profile

@router.post("/", response_model=CandidateProfileResponse)
async def create_profile(user_id: int, profile_in: CandidateProfileCreate, db: AsyncSession = Depends(get_db)) -> Any:
    return await upsert_profile(user_id, profile_in, db)

@router.post("/upload-file/{user_id}")
async def upload_file_and_autofill_profile(
    user_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Accepts a candidate CV (PDF, DOCX, TXT) or CSV file.
    Automatically parses candidate name, role, skills, experience, contact, location, URLs, and summary.
    Directly synchronizes the CandidateProfile in the database and registers the document in Resumes.
    """
    safe_filename = os.path.basename(file.filename or "resume")
    file_path = os.path.join(settings.STORAGE_PATH, f"{user_id}_{safe_filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Parse candidate details
    parsed_data = await parser.parse_resume(file_path)

    # Re-uploading a previously stored file should refresh its parsed text, not create duplicates.
    res_q = await db.execute(select(Resume).where(Resume.user_id == user_id))
    existing_resumes = res_q.scalars().all()
    resume = next(
        (item for item in existing_resumes if item.original_name == file.filename),
        None,
    )

    if resume:
        resume.filename = file_path
        resume.file_type = safe_filename.rsplit(".", 1)[-1].upper()
        resume.parsed_content = parsed_data.get("parsed_text", "")
    else:
        resume = Resume(
            user_id=user_id,
            filename=file_path,
            original_name=file.filename,
            file_type=safe_filename.rsplit(".", 1)[-1].upper(),
            is_default=not existing_resumes,
            parsed_content=parsed_data.get("parsed_text", "")
        )
    db.add(resume)

    # Update candidate profile
    prof_res = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user_id))
    profile = prof_res.scalars().first()

    skills_str = ", ".join(parsed_data["skills"]) if parsed_data.get("skills") else None

    if profile:
        if parsed_data.get("first_name"):
            profile.first_name = parsed_data["first_name"]
        if parsed_data.get("last_name"):
            profile.last_name = parsed_data["last_name"]
        if skills_str:
            profile.skills = skills_str
        if parsed_data.get("current_role"):
            profile.current_role = parsed_data["current_role"]
        if parsed_data.get("total_experience_years") is not None:
            profile.total_experience_years = parsed_data["total_experience_years"]
        if parsed_data.get("phone"):
            profile.phone = parsed_data["phone"]
        if parsed_data.get("location"):
            profile.location = parsed_data["location"]
        if parsed_data.get("summary"):
            profile.summary = parsed_data["summary"]
        if parsed_data.get("linkedin_url"):
            profile.linkedin_url = parsed_data["linkedin_url"]
        if parsed_data.get("github_url"):
            profile.github_url = parsed_data["github_url"]
        if parsed_data.get("portfolio_url"):
            profile.portfolio_url = parsed_data["portfolio_url"]
        db.add(profile)
    else:
        profile = CandidateProfile(
            user_id=user_id,
            first_name=parsed_data.get("first_name"),
            last_name=parsed_data.get("last_name"),
            skills=skills_str,
            current_role=parsed_data.get("current_role"),
            total_experience_years=parsed_data.get("total_experience_years"),
            phone=parsed_data.get("phone"),
            location=parsed_data.get("location"),
            summary=parsed_data.get("summary"),
            linkedin_url=parsed_data.get("linkedin_url"),
            github_url=parsed_data.get("github_url"),
            portfolio_url=parsed_data.get("portfolio_url"),
        )
        db.add(profile)

    await db.commit()
    await db.refresh(profile)

    extraction_succeeded = bool(parsed_data.get("parsed_text", "").strip())
    return {
        "message": (
            f"Successfully extracted candidate details from '{safe_filename}'"
            if extraction_succeeded
            else f"'{safe_filename}' was uploaded, but no readable text could be extracted. Check the PDF text layer or OCR availability."
        ),
        "extraction_status": "success" if extraction_succeeded else "failed",
        "ocr_available": light_ocr.is_available(),
        "filename": file.filename,
        "extracted_data": parsed_data,
        "profile": {
            "id": profile.id,
            "user_id": profile.user_id,
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "current_role": profile.current_role,
            "total_experience_years": profile.total_experience_years,
            "skills": profile.skills.split(", ") if profile.skills else [],
            "phone": profile.phone,
            "location": profile.location,
            "linkedin_url": profile.linkedin_url,
            "github_url": profile.github_url,
            "portfolio_url": profile.portfolio_url,
            "summary": profile.summary
        }
    }
