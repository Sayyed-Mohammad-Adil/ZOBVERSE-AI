import logging
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from app.models.job import Job
from app.models.user_job import UserJob
from app.adapters.linkedin import LinkedInAdapter
from app.adapters.jobicy import JobicyAdapter

from app.ai.laya.decision import LayaDecisionService

logger = logging.getLogger(__name__)
laya = LayaDecisionService()


def build_extraction_text(
    title: str,
    description: str,
) -> str:
    """Build extraction text only from fields supplied by the source listing."""
    return f"Title: {title}\nDescription: {description}"


async def run_discovery(
    db: AsyncSession,
    query: str = "Software Engineer",
    location: str = "Remote",
    requested_skills: str | None = None,
    source: str | None = None,
    user_id: int | None = None,
) -> dict[str, object]:
    logger.info(f"Running job discovery for {query} in {location}")

    adapters = [LinkedInAdapter(), JobicyAdapter()]
    if source:
        adapters = [
            adapter for adapter in adapters
            if adapter.source_name.lower() == source.lower()
        ]

    provider_results: list[dict[str, Any]] = []
    for adapter in adapters:
        provider_result: dict[str, Any] = {
            "source": adapter.source_name,
            "fetched": 0,
            "newly_saved": 0,
            "errors": [],
        }
        try:
            jobs = await adapter.search_jobs(
                query,
                location,
                skills=requested_skills,
            )
            provider_result["fetched"] = len(jobs)
            newly_saved = 0
            for raw_job in jobs:
                # Check if job already exists by external_job_id
                duplicate_conditions = [
                    Job.external_job_id == raw_job["external_job_id"]
                ]
                if raw_job.get("url"):
                    duplicate_conditions.append(
                        Job.canonical_url == raw_job["url"]
                    )
                existing = await db.execute(
                    select(Job).where(or_(*duplicate_conditions))
                )
                job = existing.scalars().first()
                if job:
                    if user_id is not None:
                        ownership = await db.get(UserJob, (user_id, job.id))
                        if ownership is None:
                            db.add(UserJob(user_id=user_id, job_id=job.id))
                    continue

                title = raw_job["title"]
                description = raw_job.get("description", "")
                extraction_text = build_extraction_text(
                    title=title,
                    description=description,
                )

                extracted_skills = await laya.extract_skills_from_job(
                    title,
                    extraction_text,
                )
                skills_str = ", ".join(extracted_skills) if extracted_skills else None

                new_job = Job(
                    external_job_id=raw_job["external_job_id"],
                    title=title,
                    company=raw_job["company"],
                    location=raw_job.get("location"),
                    description=description,
                    canonical_url=raw_job.get("url"),
                    application_url=raw_job.get("url"),
                    source=raw_job["source"],
                    salary_min=raw_job.get("salary_min"),
                    salary_max=raw_job.get("salary_max"),
                    salary_currency=raw_job.get("salary_currency"),
                    work_mode=raw_job.get("work_mode"),
                    skills=skills_str,
                    status="DISCOVERED"
                )
                db.add(new_job)
                await db.flush()
                if user_id is not None:
                    db.add(UserJob(user_id=user_id, job_id=new_job.id))
                newly_saved += 1

            await db.commit()
            provider_result["newly_saved"] = newly_saved
            logger.info(f"Saved jobs from {adapter.source_name}")

        except Exception as e:
            logger.error(f"Error discovering jobs from {adapter.source_name}: {e}")
            await db.rollback()
            provider_result["errors"] = [str(e)]
        provider_results.append(provider_result)

    return {
        "providers": provider_results,
        "fetched": sum(int(result["fetched"]) for result in provider_results),
        "newly_saved": sum(int(result["newly_saved"]) for result in provider_results),
        "errors": [
            f"{result['source']}: {error}"
            for result in provider_results
            for error in result["errors"]
        ],
    }
