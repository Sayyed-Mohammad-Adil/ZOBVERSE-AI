import logging
from collections import Counter
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_, func

from app.core.database import get_db
from app.models.job import Job
from app.models.profile import CandidateProfile
from app.models.preferences import CandidatePreferences
from app.models.user import User
from app.models.user_job import UserJob
from app.schemas.job import JobResponse, SkillCount
from app.ai.laya.decision import LayaDecisionService
from app.core.security import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()
laya = LayaDecisionService()

def _parse_job_skills(job: Job) -> List[str]:
    """Parse comma-separated or JSON skills from Job model into clean list."""
    if not job.skills:
        return []
    raw = job.skills.strip()
    if raw.startswith("[") and raw.endswith("]"):
        try:
            import json
            items = json.loads(raw)
            return [str(x).strip() for x in items if str(x).strip()]
        except Exception:
            pass
    return [s.strip() for s in raw.split(",") if s.strip()]

import re

def _extract_job_skills_if_empty(job: Job) -> List[str]:
    """Ensure job has skills extracted; fallback to title/description regex parsing."""
    existing = _parse_job_skills(job)
    if existing:
        return existing

    text = f"{job.title} {job.description or ''} {job.requirements or ''}".lower()
    inferred = set()

    patterns = {
        r'\bpython\b': 'Python',
        r'\bfastapi\b': 'FastAPI',
        r'\bdjango\b': 'Django',
        r'\bflask\b': 'Flask',
        r'\breact(\.js|js)?\b': 'React',
        r'\bnext(\.js|js)?\b': 'Next.js',
        r'\bvue(\.js|js)?\b': 'Vue',
        r'\bangular\b': 'Angular',
        r'\btypescript\b': 'TypeScript',
        r'\bjavascript\b': 'JavaScript',
        r'\bnode(\.js|js)?\b': 'Node.js',
        r'\bexpress(\.js)?\b': 'Express',
        r'\bnestjs\b': 'NestJS',
        r'\b(golang|go programming|go engineer|go developer)\b': 'Go',
        r'\brust\b': 'Rust',
        r'\bjava\b': 'Java',
        r'\bc\+\+\b': 'C++',
        r'\bc#\b': 'C#',
        r'\b\.net\b': '.NET',
        r'\bsql\b': 'SQL',
        r'\bpostgres(ql)?\b': 'PostgreSQL',
        r'\bmysql\b': 'MySQL',
        r'\bmongo(db)?\b': 'MongoDB',
        r'\bredis\b': 'Redis',
        r'\bdocker\b': 'Docker',
        r'\bkubernetes\b|\bk8s\b': 'Kubernetes',
        r'\baws\b|\bamazon web services\b': 'AWS',
        r'\bazure\b': 'Azure',
        r'\bgcp\b|\bgoogle cloud\b': 'GCP',
        r'\bci[/-]?cd\b': 'CI/CD',
        r'\bgit(hub|lab)?\b': 'Git',
        r'\blinux\b': 'Linux',
        r'\brest(ful)?(\s+api)?\b': 'REST API',
        r'\bgraphql\b': 'GraphQL',
        r'\btailwind(\s+css)?\b': 'Tailwind CSS',
        r'\bmachine learning\b': 'Machine Learning',
        r'\b(artificial intelligence|generative ai|llm|deep learning)\b': 'AI',
        r'\bkafka\b': 'Kafka',
        r'\brabbitmq\b': 'RabbitMQ',
        r'\bplaywright\b': 'Playwright',
        r'\bselenium\b': 'Selenium',
        r'\bpytest\b': 'Pytest',
        r'\bmicroservices\b': 'Microservices',
        r'\bdevops\b': 'DevOps',
    }

    for pat, canonical in patterns.items():
        if re.search(pat, text, re.IGNORECASE):
            inferred.add(canonical)

    return sorted(list(inferred))

def _candidate_skill_matches(
    candidate_skills: List[str],
    job_skills: List[str],
    job_corpus: str,
) -> List[str]:
    job_skills_lower = [skill.lower() for skill in job_skills]
    return [
        skill
        for skill in candidate_skills
        if any(
            skill.lower() == job_skill
            or (
                len(skill) >= 4
                and (skill.lower() in job_skill or job_skill in skill.lower())
            )
            for job_skill in job_skills_lower
        )
        or re.search(r"\b" + re.escape(skill.lower()) + r"\b", job_corpus)
    ]

def _candidate_job_match_score(
    candidate_skills: List[str],
    job_skills: List[str],
) -> Optional[float]:
    if not job_skills:
        return None
    candidate_skills_lower = [skill.lower() for skill in candidate_skills]
    matched_job_skills = sum(
        any(
            candidate_skill == job_skill.lower()
            or (
                len(candidate_skill) >= 4
                and (
                    candidate_skill in job_skill.lower()
                    or job_skill.lower() in candidate_skill
                )
            )
            for candidate_skill in candidate_skills_lower
        )
        for job_skill in job_skills
    )
    return round(matched_job_skills / len(job_skills) * 100, 1)

@router.get("/", response_model=List[JobResponse])
@router.get("/search", response_model=List[JobResponse])
async def list_jobs(
    query: Optional[str] = Query(default=None, description="General keyword search across title, company, description, requirements, and skills"),
    skills: Optional[str] = Query(default=None, description="Comma-separated skill keywords, e.g. 'Python, FastAPI, Docker'"),
    skill_match_mode: str = Query(default="any", description="'any' (OR) or 'all' (AND)"),
    work_mode: Optional[str] = Query(default=None, description="Remote, Hybrid, Onsite"),
    source: Optional[str] = Query(default=None, description="Job source: LINKEDIN, JOBICY, etc."),
    min_salary: Optional[float] = Query(default=None, description="Minimum salary threshold"),
    min_match_score: Optional[float] = Query(default=None, ge=0, le=100),
    user_id: Optional[int] = Query(default=None, description="Candidate ID to score and rank jobs against candidate profile skills"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Search and filter jobs skill-wise, keyword-wise, and candidate-alignment-wise.
    """
    # Normalize inputs in case of direct Python function calls with FastAPI Query defaults
    query_str = query if isinstance(query, str) else None
    skills_str = skills if isinstance(skills, str) else None
    match_mode = skill_match_mode if isinstance(skill_match_mode, str) else "any"
    mode_str = work_mode if isinstance(work_mode, str) else None
    source_str = source if isinstance(source, str) else None
    min_sal = min_salary if isinstance(min_salary, (int, float)) else None
    min_match = min_match_score if isinstance(min_match_score, (int, float)) else None
    if user_id is not None and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot search jobs for another user.")
    uid = current_user.id
    lim = limit if isinstance(limit, int) else 100
    off = offset if isinstance(offset, int) else 0

    stmt = select(Job).join(UserJob, UserJob.job_id == Job.id).where(
        UserJob.user_id == current_user.id,
        func.lower(Job.source).in_(["linkedin", "jobicy"]),
        func.substr(func.lower(Job.external_job_id), 1, 6) != "dummy_",
    )

    # 1. Source filter
    if source_str and source_str.lower() != "all":
        stmt = stmt.where(func.lower(Job.source) == source_str.lower())

    # 2. Work mode filter
    if mode_str and mode_str.lower() != "all":
        if mode_str.lower() == "remote":
            stmt = stmt.where(
                or_(
                    func.lower(Job.work_mode).contains("remote"),
                    func.lower(Job.location).contains("remote")
                )
            )
        else:
            stmt = stmt.where(func.lower(Job.work_mode) == mode_str.lower())

    # 3. Minimum salary filter
    if min_sal and min_sal > 0:
        stmt = stmt.where(Job.salary_min >= min_sal)

    # 4. Keyword search across title, company, description, requirements, skills
    if query_str and query_str.strip():
        q_term = f"%{query_str.strip().lower()}%"

        stmt = stmt.where(
            or_(
                func.lower(Job.title).like(q_term),
                func.lower(Job.company).like(q_term),
                func.lower(Job.description).like(q_term),
                func.lower(func.coalesce(Job.skills, "")).like(q_term),
                func.lower(func.coalesce(Job.requirements, "")).like(q_term),
                func.lower(func.coalesce(Job.location, "")).like(q_term),
            )
        )

    result = await db.execute(stmt)
    raw_jobs = result.scalars().all()

    # Parse requested skills list
    target_skills: List[str] = []
    if skills_str and skills_str.strip():
        target_skills = [s.strip().lower() for s in skills_str.split(",") if s.strip()]

    # Fetch candidate profile if user_id is provided
    candidate_skills: List[str] = []
    if uid:
        p_res = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == uid))
        prof = p_res.scalars().first()
        if prof and prof.skills:
            candidate_skills = [s.strip().lower() for s in prof.skills.split(",") if s.strip()]

    filtered_and_scored: List[Job] = []

    for job in raw_jobs:
        job_skills = _extract_job_skills_if_empty(job)
        job_skills_lower = [s.lower() for s in job_skills]

        # Combine text for fallback substring matching
        job_corpus = f"{job.title} {job.description or ''} {job.requirements or ''} {' '.join(job_skills)}".lower()

        # Skill matching evaluation
        matched_from_target: List[str] = []
        if target_skills:
            for req in target_skills:
                matched = False
                for js, jsl in zip(job_skills, job_skills_lower):
                    if req == jsl or (len(req) >= 4 and req in jsl):
                        matched_from_target.append(js)
                        matched = True
                        break
                if not matched:
                    if req == "go":
                        if re.search(r'\b(golang|go\s+(developer|engineer|programming|backend))\b', job_corpus):
                            matched_from_target.append("Go")
                    elif req == "ai":
                        if re.search(r'\b(ai|artificial intelligence|generative ai)\b', job_corpus):
                            matched_from_target.append("AI")
                    elif re.search(r'\b' + re.escape(req) + r'\b', job_corpus):
                        matched_from_target.append(req.title())


            matched_from_target = list(dict.fromkeys(matched_from_target))

            if match_mode == "all":
                if len(matched_from_target) < len(target_skills):
                    continue
            else:  # "any"
                if len(matched_from_target) == 0:
                    continue

        # Candidate profile match score calculation
        match_score = None
        candidate_matches: List[str] = []
        if candidate_skills:
            candidate_matches = _candidate_skill_matches(
                candidate_skills, job_skills, job_corpus
            )
            match_score = _candidate_job_match_score(
                candidate_skills, job_skills
            )
        if min_match is not None and (match_score is None or match_score < min_match):
            continue

        # Dynamically attach fields for Pydantic response
        setattr(job, "skills_list", job_skills)
        setattr(
            job,
            "matched_skills",
            matched_from_target if target_skills else candidate_matches,
        )
        setattr(job, "match_score", match_score)

        filtered_and_scored.append(job)

    # Sorting logic:
    # 1. If target_skills provided: sort by count of matched target skills descending
    # 2. Else if user_id provided: sort by match_score descending
    # 3. Else default by discovered_at descending
    if target_skills:
        filtered_and_scored.sort(key=lambda j: len(getattr(j, "matched_skills", []) or []), reverse=True)
    elif uid and candidate_skills:
        filtered_and_scored.sort(key=lambda j: getattr(j, "match_score", 0) or 0, reverse=True)

    # Apply pagination
    paginated = filtered_and_scored[off : off + lim]
    return paginated

@router.get("/skills/summary", response_model=List[SkillCount])
async def get_skills_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Returns available skills across jobs in the repository with counts, sorted by frequency.
    """
    result = await db.execute(
        select(Job).join(UserJob, UserJob.job_id == Job.id).where(
            UserJob.user_id == current_user.id,
            func.lower(Job.source).in_(["linkedin", "jobicy"]),
            func.substr(func.lower(Job.external_job_id), 1, 6) != "dummy_",
        )
    )
    jobs = result.scalars().all()

    counts: Counter = Counter()
    for job in jobs:
        skills = _extract_job_skills_if_empty(job)
        for s in skills:
            counts[s] += 1

    summary = [SkillCount(skill=k, count=v) for k, v in counts.most_common(50)]
    return summary

@router.get("/match-profile/{user_id}", response_model=List[JobResponse])
async def match_jobs_for_candidate(
    user_id: int,
    limit: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Fetch jobs ranked skill-wise against the candidate's profile.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot search jobs for another user.")
    return await list_jobs(
        user_id=user_id,
        limit=limit,
        current_user=current_user,
        db=db,
    )

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    result = await db.execute(
        select(Job)
        .join(UserJob, UserJob.job_id == Job.id)
        .where(Job.id == job_id, UserJob.user_id == current_user.id)
    )
    job = result.scalars().first()
    if (
        not job
        or job.source.lower() not in {"linkedin", "jobicy", "csv_import"}
        or job.external_job_id.lower().startswith("dummy_")
    ):
        raise HTTPException(status_code=404, detail="Job not found")

    skills_list = _extract_job_skills_if_empty(job)
    setattr(job, "skills_list", skills_list)
    setattr(job, "matched_skills", [])
    setattr(job, "match_score", None)
    return job
