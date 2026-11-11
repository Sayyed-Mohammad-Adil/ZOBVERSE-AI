import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.job import Job
from app.models.profile import CandidateProfile
from app.models.application import Application
from app.ai.laya.decision import LayaDecisionService

logger = logging.getLogger(__name__)

async def run_matching(db: AsyncSession, job_id: int, user_id: int):
    logger.info(f"Running matching engine for job {job_id} and user {user_id}")
    
    # 1. Fetch Job and Profile
    job_result = await db.execute(select(Job).where(Job.id == job_id))
    job = job_result.scalars().first()
    
    profile_result = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user_id))
    profile = profile_result.scalars().first()

    if not job or not profile:
        logger.error(f"Job or Profile not found for matching {job_id}:{user_id}")
        return

    # 2. Extract skills using AI
    laya = LayaDecisionService()
    profile_skills = await laya.extract_skills(f"Role: {profile.current_role}. Skills: {profile.skills}")
    job_skills = await laya.extract_skills(job.description or "")

    # 3. Deterministic basic matching score calculation
    matched_skills = set(profile_skills).intersection(set(job_skills))
    score = (len(matched_skills) / max(len(job_skills), 1)) * 100

    # 4. Save potential application context if > 70% match
    if score > 70:
        logger.info(f"High match found! Score: {score}. Preparing application record.")
        app = Application(
            job_id=job.id,
            user_id=user_id,
            status="READY",
            notes=f"Auto-matched with score {score}%"
        )
        db.add(app)
        await db.commit()
    else:
        logger.info(f"Match score too low: {score}")
