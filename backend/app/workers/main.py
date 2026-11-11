import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.background_job import BackgroundJob
from app.models.job import Job
from app.models.profile import CandidateProfile
import datetime
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def process_job(db: AsyncSession, job: BackgroundJob):
    logger.info(f"Processing job {job.id} of type {job.job_type}")
    
    if job.job_type == "job_discovery":
        logger.info("Discovering new jobs...")
        from app.workers.job_discovery import run_discovery
        payload = json.loads(job.payload) if job.payload else {}
        query = payload.get("query", "Backend Developer")
        location = payload.get("location", "Remote")
        requested_skills = payload.get("skills")
        source = payload.get("source")
        sources = payload.get("platforms")
        await run_discovery(
            db,
            query=query,
            location=location,
            requested_skills=requested_skills,
            source=source,
            sources=sources,
            user_id=payload.get("user_id"),
        )
    elif job.job_type == "duplicate_detection":
        logger.info("Running duplicate detection...")
        from app.workers.duplicate_detection import run_duplicate_detection
        try:
            payload = json.loads(job.payload or "{}") if isinstance(job.payload, str) else (job.payload or {})
            is_dupe = await run_duplicate_detection(db, payload)
            if not is_dupe:
                logger.info("No duplicates found, ready to queue matching engine")
        except Exception as e:
            logger.error(f"Error parsing duplicate detection payload: {e}")
    elif job.job_type == "matching_engine":
        logger.info("Running matching engine...")
        from app.workers.matching_engine import run_matching
        try:
            payload = json.loads(job.payload or "{}") if isinstance(job.payload, str) else (job.payload or {})
            if "job_id" in payload and "user_id" in payload:
                await run_matching(db, payload["job_id"], payload["user_id"])
        except Exception as e:
            logger.error(f"Error parsing match payload: {e}")
    elif job.job_type == "prepare_application":
        logger.info("Preparing application...")
        from app.applications.prepare import ApplicationPreparer
        try:
            payload = json.loads(job.payload or "{}") if isinstance(job.payload, str) else (job.payload or {})
            if "job_id" in payload and "user_id" in payload:
                # Need to fetch Profile and Job for the preparer
                job_result = await db.execute(select(Job).where(Job.id == payload["job_id"]))
                target_job = job_result.scalars().first()
                profile_result = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == payload["user_id"]))
                profile = profile_result.scalars().first()
                
                if target_job and profile:
                    preparer = ApplicationPreparer()
                    res = await preparer.prepare_application(profile, target_job)
                    logger.info(f"App Prepared: {res.get('status')}")
        except Exception as e:
            logger.error(f"Error preparing app payload: {e}")
            
    elif job.job_type == "apply_job":
        logger.info("Applying to job via Playwright...")
        from app.agents.playwright_agent import PlaywrightAgent
        try:
            payload = json.loads(job.payload or "{}") if isinstance(job.payload, str) else (job.payload or {})
            if "job_url" in payload:
                agent = PlaywrightAgent()
                result = await agent.apply_to_job(payload["job_url"], payload)
                logger.info(f"Playwright result: {result.get('status')}")
        except Exception as e:
            logger.error(f"Error executing Playwright job: {e}")
        
    job.status = "COMPLETED"
    job.completed_at = datetime.datetime.utcnow()
    db.add(job)
    await db.commit()

async def worker_loop():
    logger.info("Worker started.")
    while True:
        try:
            async with AsyncSessionLocal() as db:
                # Need to use specific raw SQL or ORM constructs for SKIP LOCKED
                # PostgreSQL requires FOR UPDATE SKIP LOCKED
                result = await db.execute(
                    select(BackgroundJob)
                    .where(BackgroundJob.status == "PENDING")
                    .order_by(BackgroundJob.priority.desc(), BackgroundJob.created_at.asc())
                    .with_for_update(skip_locked=True)
                    .limit(1)
                )
                job = result.scalars().first()
                if job:
                    job.status = "RUNNING"
                    job.started_at = datetime.datetime.utcnow()
                    await db.commit()
                    
                    try:
                        await process_job(db, job)
                    except Exception as e:
                        logger.error(f"Error processing job {job.id}: {e}")
                        job.status = "FAILED"
                        job.failed_at = datetime.datetime.utcnow()
                        job.last_error = str(e)
                        await db.commit()
                else:
                    await asyncio.sleep(5)
        except Exception as e:
            logger.error(f"Worker loop error: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    try:
        asyncio.run(worker_loop())
    except KeyboardInterrupt:
        logger.info("Worker stopped.")
