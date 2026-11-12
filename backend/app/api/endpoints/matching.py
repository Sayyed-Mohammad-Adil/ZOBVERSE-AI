from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.job import Job
from app.models.profile import CandidateProfile
from app.models.preferences import CandidatePreferences
from app.schemas.matching import MatchRequest, MatchResult
from app.matching.engine import MatchingEngine
from app.adapters.registry import ALL_SOURCE_NAMES
from app.models.user import User

router = APIRouter()
engine = MatchingEngine()

@router.post("/evaluate", response_model=MatchResult)
async def evaluate_match(
    req: MatchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 1. Fetch Job
    job_res = await db.execute(select(Job).where(Job.id == req.job_id))
    job = job_res.scalars().first()
    if (
        not job
        or job.source.lower() not in ALL_SOURCE_NAMES
        or job.external_job_id.lower().startswith("dummy_")
    ):
        raise HTTPException(status_code=404, detail="Job not found")

    # 2. Fetch Profile & Preferences
    prof_res = await db.execute(
        select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    )
    profile = prof_res.scalars().first()
    if not profile:
        raise HTTPException(
            status_code=400,
            detail="Create a candidate profile before evaluating job matches.",
        )

    pref_res = await db.execute(
        select(CandidatePreferences).where(
            CandidatePreferences.user_id == current_user.id
        )
    )
    preferences = pref_res.scalars().first()

    # 3. Calculate real match using deterministic rules + Laya decision
    match_data = await engine.calculate_match(profile, preferences, job)
    breakdown = match_data["breakdown"]

    return MatchResult(
        job_id=req.job_id,
        score=float(match_data["total_match_score"]),
        skills_match=float(breakdown["skills"]),
        experience_match=float(breakdown["experience"]),
        location_match=float(breakdown["location"]),
        salary_match=float(breakdown["salary"]),
        role_match=float(breakdown["role"]),
        industry_match=85.0,
        matched_skills=match_data["matched_skills"],
        missing_skills=match_data["missing_skills"],
        potential_concerns=match_data["concerns"],
        explanation=f"Evaluated as {match_data['decision']} with {match_data['total_match_score']}% alignment against profile."
    )
