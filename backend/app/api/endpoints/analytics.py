from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.core.database import get_db
from app.models.job import Job
from app.models.application import Application
from app.models.resume import Resume
from app.models.profile import CandidateProfile
from app.models.preferences import CandidatePreferences
from app.models.audit_log import AuditLog
from app.models.interview import Interview
from app.models.offer import Offer
from app.models.user import User
from app.models.user_job import UserJob
from app.adapters.registry import JOB_PLATFORM_SOURCES
from app.core.security import get_current_user
from typing import Any, Dict, List
from collections import Counter
import json

router = APIRouter()

@router.get("/{user_id}")
async def get_dashboard_analytics(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot view another user's analytics.")

    # 1. Total jobs discovered for this account
    jobs_count_res = await db.execute(
        select(func.count(Job.id))
        .join(UserJob, UserJob.job_id == Job.id)
        .where(
            UserJob.user_id == user_id,
            func.lower(Job.source).in_(JOB_PLATFORM_SOURCES),
            func.substr(func.lower(Job.external_job_id), 1, 6) != "dummy_",
        )
    )
    total_jobs = jobs_count_res.scalar() or 0

    # 2. User applications breakdown
    apps_res = await db.execute(select(Application, Job).outerjoin(Job, Application.job_id == Job.id).where(Application.user_id == user_id))
    app_rows = apps_res.all()
    
    total_apps = len(app_rows)
    ready_count = sum(1 for a, _ in app_rows if a.status == "READY")
    applied_count = sum(1 for a, _ in app_rows if a.status == "APPLIED")
    interview_count = sum(1 for a, _ in app_rows if a.status == "INTERVIEW")
    offer_count = sum(1 for a, _ in app_rows if a.status == "OFFER")
    rejected_count = sum(1 for a, _ in app_rows if a.status == "REJECTED")
    skipped_count = sum(1 for a, _ in app_rows if a.status == "SKIPPED")
    applications_by_day = Counter(
        application.created_at.date().isoformat()
        for application, _ in app_rows
        if application.created_at is not None
    )

    # 3. Interviews & Offers tables count
    interviews_res = await db.execute(select(func.count(Interview.id)).where(Interview.user_id == user_id))
    scheduled_interviews = interviews_res.scalar() or interview_count

    offers_res = await db.execute(select(func.count(Offer.id)).where(Offer.user_id == user_id))
    recorded_offers = offers_res.scalar() or offer_count

    # 4. Resumes count
    resumes_res = await db.execute(select(func.count(Resume.id)).where(Resume.user_id == user_id))
    total_resumes = resumes_res.scalar() or 0

    # 5. Profile & Preferences status
    prof_res = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user_id))
    profile = prof_res.scalars().first()
    
    pref_res = await db.execute(select(CandidatePreferences).where(CandidatePreferences.user_id == user_id))
    preferences = pref_res.scalars().first()

    # Calculate real profile completeness
    profile_fields = [
        bool(profile and profile.current_role),
        bool(profile and profile.skills),
        bool(profile and profile.summary),
        bool(profile and profile.total_experience_years),
        bool(profile and (profile.linkedin_url or profile.github_url)),
        total_resumes > 0,
        bool(preferences and preferences.target_salary),
        bool(preferences and preferences.preferred_roles)
    ]
    completion_percentage = int((sum(1 for f in profile_fields if f) / len(profile_fields)) * 100)

    # 6. Skill Gap Analysis (Section 62)
    candidate_skills = []
    if profile and profile.skills:
        try:
            candidate_skills = json.loads(profile.skills) if profile.skills.startswith("[") else [s.strip() for s in profile.skills.split(",")]
        except Exception:
            candidate_skills = [s.strip() for s in profile.skills.split(",")]
    candidate_skills_lower = {s.lower() for s in candidate_skills}

    # Aggregate skills from discovered jobs
    all_jobs_res = await db.execute(
        select(Job.skills)
        .join(UserJob, UserJob.job_id == Job.id)
        .where(
            UserJob.user_id == user_id,
            Job.skills.isnot(None),
            func.lower(Job.source).in_(JOB_PLATFORM_SOURCES),
            func.substr(func.lower(Job.external_job_id), 1, 6) != "dummy_",
        )
        .order_by(Job.discovered_at.desc())
        .limit(100)
    )
    job_skills_list = all_jobs_res.scalars().all()
    job_skill_counter = Counter()
    for s_entry in job_skills_list:
        if not s_entry:
            continue
        try:
            tokens = json.loads(s_entry) if s_entry.startswith("[") else [x.strip() for x in s_entry.split(",")]
            for tok in tokens:
                if tok and len(tok) > 1:
                    job_skill_counter[tok.title()] += 1
        except Exception:
            pass

    top_requested_skills = [skill for skill, _ in job_skill_counter.most_common(12)]
    missing_skills = [s for s in top_requested_skills if s.lower() not in candidate_skills_lower][:6]

    # 7. Breakdown by Source
    source_counter = Counter()
    for _, job in app_rows:
        if job and job.source:
            source_counter[job.source] += 1
        else:
            source_counter["Direct/Manual"] += 1

    # 8. Recent Activity Logs
    logs_res = await db.execute(
        select(AuditLog).where(AuditLog.user_id == user_id).order_by(AuditLog.created_at.desc()).limit(8)
    )
    recent_logs = [
        {"action": l.action, "created_at": l.created_at.isoformat(), "details": l.details} for l in logs_res.scalars().all()
    ]

    return {
        "total_jobs_discovered": total_jobs,
        "applications": {
            "total": total_apps,
            "ready": ready_count,
            "applied": applied_count,
            "interview": scheduled_interviews,
            "offer": recorded_offers,
            "rejected": rejected_count,
            "skipped": skipped_count
        },
        "resumes_count": total_resumes,
        "profile_completion": completion_percentage,
        "automation_mode": preferences.automation_mode if preferences else "Assisted",
        "daily_limit": preferences.daily_application_limit if preferences else 10,
        "preferred_currency": preferences.currency if preferences else "USD",
        "recent_activity": recent_logs,
        "skill_gap_analysis": {
            "candidate_skills": candidate_skills[:10],
            "top_requested_skills": top_requested_skills,
            "missing_skills": missing_skills
        },
        "applications_by_source": dict(source_counter),
        "application_velocity": [
            {"date": day, "count": count}
            for day, count in sorted(applications_by_day.items())
        ]
    }
