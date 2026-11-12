import asyncio
import logging
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from app.models.job import Job
from app.models.user_job import UserJob
from app.adapters.registry import (
    DEFAULT_JOB_SOURCES,
    PLATFORMS_BY_ID,
    create_adapter,
)
from app.schemas.platform_job import PlatformJob

from app.ai.laya.decision import LayaDecisionService

logger = logging.getLogger(__name__)
laya = LayaDecisionService()


def build_extraction_text(
    title: str,
    description: str,
) -> str:
    """Build extraction text only from fields supplied by the source listing."""
    return f"Title: {title}\nDescription: {description}"


def canonicalize_job_url(url: str) -> str:
    parts = urlsplit(url.strip())
    query = [
        (key, value)
        for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if not key.lower().startswith("utm_")
        and key.lower() not in {"trk", "trackingid", "refid", "ref"}
    ]
    host = (parts.hostname or "").lower()
    if host.startswith("www."):
        host = host[4:]
    netloc = host
    if parts.port:
        netloc = f"{host}:{parts.port}"
    path = parts.path.rstrip("/") or "/"
    return urlunsplit(
        (parts.scheme.lower(), netloc, path, urlencode(query, doseq=True), "")
    )


async def run_discovery(
    db: AsyncSession,
    query: str = "Software Engineer",
    location: str = "Remote",
    requested_skills: str | None = None,
    source: str | None = None,
    sources: list[str] | None = None,
    user_id: int | None = None,
) -> dict[str, object]:
    logger.info(f"Running job discovery for {query} in {location}")

    selected_sources = sources or ([source] if source else DEFAULT_JOB_SOURCES)

    provider_results: list[dict[str, Any]] = []
    searchable_platforms = []
    for platform_id in selected_sources:
        platform = PLATFORMS_BY_ID[platform_id]
        provider_result: dict[str, Any] = {
            "source": platform.source_name,
            "status": "no_results" if platform.search_available else "guided_only",
            "fetched": 0,
            "newly_saved": 0,
            "errors": [],
            "warnings": [],
        }
        provider_results.append(provider_result)
        if not platform.search_available:
            provider_result["warnings"] = [platform.notice]
            continue

        adapter = create_adapter(platform_id)
        if adapter is None:
            provider_result["status"] = "error"
            provider_result["errors"] = [
                f"No search adapter is registered for {platform.name}."
            ]
            continue

        searchable_platforms.append((platform, adapter, provider_result))

    search_results = await asyncio.gather(
        *(
            adapter.search_jobs(query, location, skills=requested_skills)
            for _, adapter, _ in searchable_platforms
        ),
        return_exceptions=True,
    )

    for (platform, adapter, provider_result), search_result in zip(
        searchable_platforms, search_results
    ):
        try:
            if isinstance(search_result, BaseException):
                raise search_result
            jobs = search_result
            provider_result["fetched"] = len(jobs)
            provider_result["status"] = "available" if jobs else "no_results"
            newly_saved = 0
            for listing in jobs:
                normalized = PlatformJob.model_validate(
                    await adapter.normalize_job(listing)
                )
                if normalized.source.lower() != platform.source_name.lower():
                    raise ValueError(
                        f"{platform.name} adapter returned source {normalized.source!r}."
                    )
                raw_job = normalized.model_dump()
                raw_job["url"] = canonicalize_job_url(raw_job["url"])

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
                    salary_period=raw_job.get("salary_period"),
                    experience=raw_job.get("experience"),
                    work_mode=raw_job.get("work_mode"),
                    posted_at=raw_job.get("posted_at"),
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
            logger.error(f"Error discovering jobs from {platform.source_name}: {e}")
            await db.rollback()
            provider_result["status"] = "error"
            provider_result["errors"] = [str(e)]
    return {
        "providers": provider_results,
        "fetched": sum(int(result["fetched"]) for result in provider_results),
        "newly_saved": sum(int(result["newly_saved"]) for result in provider_results),
        "errors": [
            f"{result['source']}: {error}"
            for result in provider_results
            for error in result["errors"]
        ],
        "warnings": [
        f"{result['source']}: {warning}"
        for result in provider_results
        for warning in result["warnings"]
        ],
    }
