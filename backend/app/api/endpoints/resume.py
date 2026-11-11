from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from app.core.database import get_db
from app.models.resume import Resume
from app.models.profile import CandidateProfile
from app.schemas.resume import ResumeCreate, ResumeUpdate, ResumeResponse
from app.resume.parser import ResumeParser
from typing import Any, List
import shutil
import os
from app.core.config import settings

router = APIRouter()
parser = ResumeParser()

os.makedirs(settings.STORAGE_PATH, exist_ok=True)

@router.post("/", response_model=ResumeResponse)
async def upload_resume(user_id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)) -> Any:
    # Save file to disk
    file_path = os.path.join(settings.STORAGE_PATH, f"{user_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Check if first resume to make default
    result = await db.execute(select(Resume).where(Resume.user_id == user_id))
    existing_resumes = result.scalars().all()
    is_first = len(existing_resumes) == 0

    # Parse resume text & extract profile features
    parsed_data = await parser.parse_resume(file_path)
    
    resume = Resume(
        user_id=user_id,
        filename=file_path,
        original_name=file.filename,
        file_type=file.filename.split(".")[-1].upper(),
        is_default=is_first,
        parsed_content=parsed_data.get("parsed_text", "")
    )
    db.add(resume)

    # Auto-populate or enrich candidate profile with extracted details
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
        new_profile = CandidateProfile(
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
        db.add(new_profile)

    await db.commit()
    await db.refresh(resume)
    return resume

@router.get("/{user_id}", response_model=List[ResumeResponse])
async def get_resumes(user_id: int, db: AsyncSession = Depends(get_db)) -> Any:
    result = await db.execute(select(Resume).where(Resume.user_id == user_id).order_by(Resume.created_at.desc()))
    return result.scalars().all()

@router.put("/{resume_id}/default", response_model=ResumeResponse)
async def set_default_resume(resume_id: int, user_id: int, db: AsyncSession = Depends(get_db)) -> Any:
    # Set all user resumes is_default=False
    await db.execute(update(Resume).where(Resume.user_id == user_id).values(is_default=False))
    # Set this resume is_default=True
    res = await db.execute(select(Resume).where(Resume.id == resume_id, Resume.user_id == user_id))
    target = res.scalars().first()
    if not target:
        raise HTTPException(status_code=404, detail="Resume not found")
    target.is_default = True
    db.add(target)
    await db.commit()
    await db.refresh(target)
    return target

@router.delete("/{resume_id}")
async def delete_resume(resume_id: int, db: AsyncSession = Depends(get_db)) -> Any:
    res = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = res.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if os.path.exists(resume.filename):
        try:
            os.remove(resume.filename)
        except Exception:
            pass
    await db.delete(resume)
    await db.commit()
    return {"message": "Resume deleted successfully"}

@router.get("/ocr/status")
async def get_ocr_status() -> Any:
    """Check Light-OCR status, version, and hardware runtime diagnostics."""
    from app.resume.parser import light_ocr
    return {
        "engine": "light-ocr",
        "available": light_ocr.is_available(),
        "version": light_ocr.get_version(),
        "diagnostics": light_ocr.get_diagnostics(),
    }

@router.post("/ocr/test")
async def test_ocr_upload(file: UploadFile = File(...)) -> Any:
    """Test OCR text extraction directly on an image or PDF file."""
    from app.resume.parser import light_ocr
    temp_path = os.path.join(settings.STORAGE_PATH, f"ocr_test_{file.filename}")
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        text, conf = light_ocr.extract_text(temp_path)
        return {
            "filename": file.filename,
            "text": text,
            "characters": len(text),
            "confidence": conf,
        }
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


