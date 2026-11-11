import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.job import Job
import json

logger = logging.getLogger(__name__)

async def run_duplicate_detection(db: AsyncSession, raw_job_data: dict) -> bool:
    logger.info(f"Checking for duplicates for job {raw_job_data.get('title')} at {raw_job_data.get('company')}")
    
    # Check by company and title
    result = await db.execute(
        select(Job).where(Job.company == raw_job_data.get('company')).where(Job.title == raw_job_data.get('title'))
    )
    existing_jobs = result.scalars().all()
    
    if existing_jobs:
        logger.info(f"Duplicate found for {raw_job_data.get('title')} at {raw_job_data.get('company')}")
        return True
        
    return False
