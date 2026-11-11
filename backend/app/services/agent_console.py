import asyncio
import json
import logging
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.models import (
    Job,
    CandidateProfile,
    CandidatePreferences,
    Application,
    Resume,
    AuditLog,
    CandidateCredential,
    UserJob,
)
from app.matching.engine import MatchingEngine
from app.ai.laya.decision import LayaDecisionService
from app.adapters.registry import DEFAULT_JOB_SOURCES, PLATFORMS_BY_ID

logger = logging.getLogger(__name__)

class AgentConsoleService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AgentConsoleService, cls).__new__(cls)
            cls._instance.user_buffers = {}       # user_id -> List[Dict]
            cls._instance.user_subscribers = {}   # user_id -> Set[asyncio.Queue]
            cls._instance.matching_engine = MatchingEngine()
            cls._instance.laya = LayaDecisionService()
        return cls._instance

    def _get_buffer(self, user_id: int) -> List[Dict[str, Any]]:
        if user_id not in self.user_buffers:
            self.user_buffers[user_id] = []
        return self.user_buffers[user_id]

    async def broadcast_log(
        self,
        user_id: int,
        level: str,
        stage: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        db: Optional[AsyncSession] = None
    ) -> Dict[str, Any]:
        """Broadcast a structured log event to user buffer and active SSE subscribers."""
        now = datetime.datetime.now(datetime.timezone.utc)
        log_entry = {
            "id": f"log_{user_id}_{int(now.timestamp() * 1000)}_{len(self._get_buffer(user_id))}",
            "timestamp": now.isoformat(),
            "time_str": now.strftime("%H:%M:%S"),
            "level": level.upper(),     # INFO, DISCOVERY, MATCHING, AUTO_APPLY, SUCCESS, WARN, ERROR
            "stage": stage.upper(),     # DAEMON, SCRAPER, MATCHER, AUTO_APPLY, AUDIT
            "message": message,
            "details": details or {}
        }

        # Append to bounded buffer (keep last 300 entries)
        buf = self._get_buffer(user_id)
        buf.append(log_entry)
        if len(buf) > 300:
            self.user_buffers[user_id] = buf[-300:]

        # Broadcast to active SSE subscriber queues
        if user_id in self.user_subscribers:
            for q in list(self.user_subscribers[user_id]):
                try:
                    q.put_nowait(log_entry)
                except Exception:
                    pass

        # Optionally log into AuditLog table
        if db and level.upper() in ["SUCCESS", "AUTO_APPLY", "WARN", "ERROR"]:
            try:
                audit = AuditLog(
                    user_id=user_id,
                    action=f"AGENT_{stage.upper()}",
                    service="agent_console",
                    details=message[:250]
                )
                db.add(audit)
                await db.commit()
            except Exception:
                pass

        return log_entry

    def subscribe(self, user_id: int) -> asyncio.Queue:
        """Register a new SSE stream listener queue for a user."""
        q = asyncio.Queue()
        if user_id not in self.user_subscribers:
            self.user_subscribers[user_id] = set()
        self.user_subscribers[user_id].add(q)
        return q

    def unsubscribe(self, user_id: int, q: asyncio.Queue):
        """Unregister an SSE listener queue."""
        if user_id in self.user_subscribers:
            self.user_subscribers[user_id].discard(q)
            if not self.user_subscribers[user_id]:
                del self.user_subscribers[user_id]

    def get_logs(self, user_id: int, limit: int = 100) -> List[Dict[str, Any]]:
        """Return cached logs for a user."""
        buf = self._get_buffer(user_id)
        return buf[-limit:]

    def clear_logs(self, user_id: int):
        """Clear log buffer for a user."""
        self.user_buffers[user_id] = []

    async def run_auto_apply_cycle(
        self,
        db: AsyncSession,
        user_id: int,
        max_apply: int = 5,
        min_score: int = 50
    ) -> Dict[str, Any]:
        """
        Execute an end-to-end auto-apply cycle for the candidate:
        1. Read profile & preferences
        2. Filter unapplied jobs
        3. Score candidates with MatchingEngine
        4. Submit application (Autonomous) or queue in Review (Assisted)
        5. Stream real-time logs for each event
        """
        await self.broadcast_log(
            user_id, "INFO", "DAEMON",
            f"🚀 Starting Auto-Apply Execution Cycle (Target: up to {max_apply} applications)..."
        )

        # 1. Load candidate profile
        prof_res = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user_id))
        profile = prof_res.scalars().first()

        if not profile or not profile.skills:
            await self.broadcast_log(
                user_id, "WARN", "DAEMON",
                "⚠️ Candidate profile is incomplete (no verified skills). Please upload your CV or fill profile to enable auto-matching."
            )
            await self.broadcast_log(
                user_id, "WARN", "DAEMON",
                "Auto-Apply Cycle Complete: stopped because the CV profile has no skills.",
            )
            return {"status": "aborted", "reason": "Profile missing verified skills", "applied": 0, "queued": 0}

        # 2. Load candidate preferences
        pref_res = await db.execute(select(CandidatePreferences).where(CandidatePreferences.user_id == user_id))
        preferences = pref_res.scalars().first()
        if not preferences:
            preferences = CandidatePreferences(
                user_id=user_id,
                automation_mode="Autonomous",
                daily_application_limit=10,
                remote_only=False
            )
            db.add(preferences)
            await db.commit()

        auto_mode = (preferences.automation_mode or "Autonomous").capitalize()
        daily_limit = preferences.daily_application_limit or 10

        cand_name = f"{profile.first_name or 'Candidate'} {profile.last_name or ''}".strip()
        await self.broadcast_log(
            user_id, "INFO", "DAEMON",
            f"📄 CV loaded for {cand_name}. Role: {profile.current_role or 'Not specified'} | "
            f"Experience: {profile.total_experience_years if profile.total_experience_years is not None else 'Not specified'} years | "
            f"Skills: {profile.skills} | Mode: {auto_mode} | Daily Limit: {daily_limit}",
            details={
                "candidate_role": profile.current_role,
                "experience_years": profile.total_experience_years,
                "cv_skills": profile.skills,
                "automation_mode": auto_mode,
                "daily_limit": daily_limit,
            },
        )
        await self.broadcast_log(
            user_id, "INFO", "DAEMON",
            "⚙️ Cycle stages: load CV/preferences → load eligible jobs → score threshold → Ollama CV-fit review → prepare application → human submission review.",
            details={"ollama_model": self.matching_engine.ollama.model},
        )

        # 2b. Check LinkedIn Credentials & Session Status
        cred_q = await db.execute(
            select(CandidateCredential).where(
                CandidateCredential.user_id == user_id,
                CandidateCredential.platform == "linkedin",
                CandidateCredential.is_active == True
            )
        )
        linkedin_cred = cred_q.scalars().first()
        linkedin_connected = bool(linkedin_cred and linkedin_cred.status == "CONNECTED")
        if linkedin_connected:
            cred_method = "Session Cookie (li_at)" if linkedin_cred.auth_method == "session_cookie" else f"Credentials ({linkedin_cred.username or 'Account'})"
            await self.broadcast_log(
                user_id, "INFO", "DAEMON",
                f"🔗 LinkedIn Connection Verified: {cred_method} | Easy-Apply Auto Submit: {'ACTIVE' if linkedin_cred.auto_easy_apply else 'MANUAL APPROVAL'}"
            )
        else:
            await self.broadcast_log(
                user_id, "INFO", "DAEMON",
                "ℹ️ LinkedIn direct session not configured. LinkedIn Easy Apply roles will be prepared with CV & routed to Review Queue."
            )

        # 3. Check existing applications count today
        today_start = datetime.datetime.now(datetime.timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        apps_today_res = await db.execute(
            select(func.count(Application.id)).where(
                Application.user_id == user_id,
                Application.created_at >= today_start
            )
        )
        apps_today_count = apps_today_res.scalar() or 0

        remaining_quota = max(0, daily_limit - apps_today_count)
        if remaining_quota <= 0:
            await self.broadcast_log(
                user_id, "WARN", "AUTO_APPLY",
                f"🛑 Daily application limit reached ({apps_today_count}/{daily_limit} today). Respecting candidate safety constraints."
            )
            await self.broadcast_log(
                user_id, "WARN", "DAEMON",
                "Auto-Apply Cycle Complete: daily application limit reached.",
            )
            return {"status": "limit_reached", "applied": 0, "queued": 0, "message": "Daily limit reached"}

        actual_max_to_apply = min(max_apply, remaining_quota)
        await self.broadcast_log(
            user_id, "INFO", "AUTO_APPLY",
            f"📊 Daily quota check: {apps_today_count}/{daily_limit} used; "
            f"{remaining_quota} remain. This cycle will process at most {actual_max_to_apply}.",
            details={
                "used_today": apps_today_count,
                "daily_limit": daily_limit,
                "remaining_today": remaining_quota,
                "cycle_max": actual_max_to_apply,
                "minimum_deterministic_score": min_score,
            },
        )

        # 4. Find default or latest resume
        res_q = await db.execute(
            select(Resume).where(Resume.user_id == user_id).order_by(Resume.is_default.desc(), Resume.id.desc())
        )
        default_resume = res_q.scalars().first()
        resume_id = default_resume.id if default_resume else None

        # 5. Query unapplied jobs
        applied_jobs_res = await db.execute(
            select(Application.job_id).where(Application.user_id == user_id)
        )
        applied_job_ids = set(applied_jobs_res.scalars().all())
        selected_source_names = [
            PLATFORMS_BY_ID[source].source_name.lower()
            for source in (preferences.job_sources or DEFAULT_JOB_SOURCES)
            if source in PLATFORMS_BY_ID
        ]
        selected_source_names.append("csv_import")

        jobs_res = await db.execute(
            select(Job)
            .join(UserJob, UserJob.job_id == Job.id)
            .where(
                UserJob.user_id == user_id,
                Job.id.notin_(applied_job_ids) if applied_job_ids else True,
                func.lower(Job.source).in_(selected_source_names),
                func.substr(func.lower(Job.external_job_id), 1, 6) != "dummy_",
                Job.status.notin_(["APPLIED", "SKIPPED"])
            ).order_by(Job.id.desc()).limit(35)
        )
        eligible_jobs = jobs_res.scalars().all()

        await self.broadcast_log(
            user_id, "DISCOVERY", "SCRAPER",
            f"🔍 Pipeline Scan: Found {len(eligible_jobs)} unapplied job listings in database. Initiating match evaluations..."
        )

        if not eligible_jobs:
            await self.broadcast_log(
                user_id, "INFO", "SCRAPER",
                "ℹ️ No new unapplied jobs found. Triggering fresh web discovery scraper..."
            )
            await self.broadcast_log(
                user_id, "WARN", "DAEMON",
                "Auto-Apply Cycle Complete: no eligible jobs were found in this account.",
            )
            return {"status": "no_jobs", "applied": 0, "queued": 0}

        # 6. Evaluate jobs with MatchingEngine
        deterministic_candidates = []
        skipped_jobs = 0
        for job in eligible_jobs:
            salary_detail = {
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "salary_currency": job.salary_currency,
                "salary_period": job.salary_period,
            }
            job_details = {
                "job_id": job.id,
                "job_title": job.title,
                "company": job.company,
                "source": job.source,
                "location": job.location,
                **salary_detail,
                "job_description": (job.description or "Description not provided")[:3000],
                "requirements": (job.requirements or "Requirements not provided")[:1500],
                "candidate_role": profile.current_role,
                "candidate_experience_years": profile.total_experience_years,
                "candidate_cv_skills": profile.skills,
                "candidate_summary": profile.summary,
            }
            await self.broadcast_log(
                user_id, "INFO", "MATCHER",
                f"📂 [{job.id}/{len(eligible_jobs)}] Reviewing {job.title} at {job.company} | "
                f"Salary: {job.salary_min if job.salary_min is not None else 'Not listed'}"
                f"{'–' + str(job.salary_max) if job.salary_max is not None else ''} "
                f"{job.salary_currency or ''} {job.salary_period or ''} | "
                f"Role description: {(job.description or 'Not provided')[:260]}",
                details=job_details,
            )
            try:
                match_data = await self.matching_engine.calculate_match(profile, preferences, job)
                score = match_data.get("total_match_score", 0)
                matched_s = match_data.get("matched_skills", [])
                match_details = {
                    **job_details,
                    "deterministic_match_score": score,
                    "score_breakdown": match_data.get("breakdown", {}),
                    "matched_skills": matched_s,
                    "missing_skills": match_data.get("missing_skills", []),
                    "matching_concerns": match_data.get("concerns", []),
                }
                await self.broadcast_log(
                    user_id, "MATCHING", "MATCHER",
                    f"📐 Rules-based CV match for '{job.title}' at {job.company}: {score}% "
                    f"(skills: {match_data.get('breakdown', {}).get('skills')}%, "
                    f"experience: {match_data.get('breakdown', {}).get('experience')}%, "
                    f"location: {match_data.get('breakdown', {}).get('location')}%, "
                    f"salary: {match_data.get('breakdown', {}).get('salary')}%, "
                    f"role: {match_data.get('breakdown', {}).get('role')}%).",
                    details=match_details,
                )
                if score < min_score:
                    skipped_jobs += 1
                    await self.broadcast_log(
                        user_id, "WARN", "MATCHER",
                        f"⏭️ Skipped '{job.title}' at {job.company}: rules score {score}% is below the {min_score}% threshold.",
                        details=match_details,
                    )
                else:
                    deterministic_candidates.append((job, score, match_data, job_details))
            except Exception as e:
                logger.error(f"Error matching job {job.id}: {e}")
                skipped_jobs += 1
                await self.broadcast_log(
                    user_id, "ERROR", "MATCHER",
                    f"❌ Could not complete CV evaluation for '{job.title}' at {job.company}; not applying.",
                    details={**job_details, "error": str(e)},
                )

        # Rank deterministically first, then use Ollama for only the jobs this cycle may prepare.
        deterministic_candidates.sort(key=lambda x: x[1], reverse=True)
        ollama_candidates = deterministic_candidates[:actual_max_to_apply]
        scored_jobs = []
        for job, score, match_data, job_details in ollama_candidates:
            await self.broadcast_log(
                user_id, "INFO", "MATCHER",
                f"🧠 Ollama ({self.matching_engine.ollama.model}) is comparing your CV with "
                f"'{job.title}' requirements, role description, and salary context.",
                details=job_details,
            )
            ollama_fit = await self.matching_engine.evaluate_job_fit(profile, job)
            evaluated_details = {
                **job_details,
                "deterministic_match_score": score,
                "score_breakdown": match_data.get("breakdown", {}),
                "matched_skills": match_data.get("matched_skills", []),
                "missing_skills": match_data.get("missing_skills", []),
                "matching_concerns": match_data.get("concerns", []),
                "ollama_status": ollama_fit["status"],
                "ollama_model": ollama_fit["model"],
                "ollama_fit_score": ollama_fit["fit_score"],
                "ollama_recommendation": ollama_fit["recommendation"],
                "ollama_rationale": ollama_fit["rationale"],
                "ollama_matched_skills": ollama_fit["matched_skills"],
                "ollama_missing_skills": ollama_fit["missing_skills"],
                "ollama_concerns": ollama_fit["concerns"],
            }
            await self.broadcast_log(
                user_id, "MATCHING", "MATCHER",
                f"🎯 Ollama CV-fit for '{job.title}' at {job.company}: "
                f"{ollama_fit['fit_score'] if ollama_fit['fit_score'] is not None else 'Unavailable'}"
                f"{'%' if ollama_fit['fit_score'] is not None else ''} "
                f"({ollama_fit['recommendation']}) | {ollama_fit['rationale']}",
                details=evaluated_details,
            )
            if ollama_fit["recommendation"] == "poor_fit":
                skipped_jobs += 1
                await self.broadcast_log(
                    user_id, "WARN", "MATCHER",
                    f"⏭️ Skipped '{job.title}' at {job.company}: Ollama assessed it as a poor CV fit.",
                    details=evaluated_details,
                )
            else:
                scored_jobs.append((job, score, match_data, ollama_fit))

        await self.broadcast_log(
            user_id, "INFO", "AUTO_APPLY",
            f"📊 Evaluation complete: {len(eligible_jobs)} reviewed, "
            f"{len(deterministic_candidates)} passed the score threshold, "
            f"{len(scored_jobs)} passed Ollama fit review, {skipped_jobs} skipped. "
            f"Preparing {len(scored_jobs)} application(s) for candidate review.",
            details={
                "reviewed": len(eligible_jobs),
                "passed_score_threshold": len(deterministic_candidates),
                "passed_ollama_fit_review": len(scored_jobs),
                "skipped": skipped_jobs,
                "selected": len(scored_jobs),
            },
        )

        applied_count = 0
        queued_count = 0

        # 7. Apply or Queue in Review
        for job, score, match_data, ollama_fit in scored_jobs:
            is_linkedin_job = bool(job.source and "linkedin" in job.source.lower())
            is_manual_source = not is_linkedin_job
            reason = (
                "External application portal requires candidate submission."
                if is_manual_source
                else "LinkedIn Easy Apply submission is not implemented; candidate review and submission are required."
            )
            if is_linkedin_job and not linkedin_connected:
                reason = "LinkedIn session is not connected; candidate review and submission are required."
            elif auto_mode != "Autonomous":
                reason = f"{auto_mode} mode requires candidate approval before submission."

            job_details = {
                "job_id": job.id,
                "job_title": job.title,
                "company": job.company,
                "source": job.source,
                "location": job.location,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "salary_currency": job.salary_currency,
                "salary_period": job.salary_period,
                "job_description": (job.description or "Description not provided")[:3000],
                "requirements": (job.requirements or "Requirements not provided")[:1500],
                "deterministic_match_score": score,
                "score_breakdown": match_data.get("breakdown", {}),
                "matched_skills": match_data.get("matched_skills", []),
                "missing_skills": match_data.get("missing_skills", []),
                "matching_concerns": match_data.get("concerns", []),
                "ollama_status": ollama_fit["status"],
                "ollama_model": ollama_fit["model"],
                "ollama_fit_score": ollama_fit["fit_score"],
                "ollama_recommendation": ollama_fit["recommendation"],
                "ollama_rationale": ollama_fit["rationale"],
                "ollama_concerns": ollama_fit["concerns"],
                "application_step": "READY_FOR_CANDIDATE_REVIEW",
                "submission_reason": reason,
            }
            await self.broadcast_log(
                user_id, "INFO", "AUTO_APPLY",
                f"📝 Fit checks passed for '{job.title}' at {job.company}. "
                "Preparing application and recording it in your review queue.",
                details=job_details,
            )

            app = Application(
                job_id=job.id,
                user_id=user_id,
                resume_id=resume_id,
                status="READY",
                notes=(
                    f"Prepared with {score}% deterministic match. "
                    f"Ollama: {ollama_fit['recommendation']} "
                    f"({ollama_fit['fit_score']}%). {reason}"
                ),
                history=[{
                    "status": "READY",
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "action": "CV evaluated and application prepared; awaiting candidate submission",
                    "match_score": score,
                    "ollama_fit": ollama_fit,
                    "reason": reason,
                }],
            )
            db.add(app)
            await db.commit()
            await db.refresh(app)
            queued_count += 1

            await self.broadcast_log(
                user_id, "AUTO_APPLY", "AUTO_APPLY",
                f"✅ Application prepared for '{job.title}' at {job.company} "
                f"({score}% rules match; Ollama {ollama_fit['recommendation']}) -> "
                f"Review Queue (App #{app.id}). Not submitted: {reason}",
                details={**job_details, "status": "READY", "application_id": app.id},
            )

            await asyncio.sleep(0.5) # realistic cadence for visual logging

        # 8. Summary Log
        await self.broadcast_log(
            user_id, "SUCCESS", "DAEMON",
            f"✨ Cycle complete. Submitted: {applied_count} | Prepared for your review: {queued_count} | "
            f"Skipped after checks: {skipped_jobs} | Total evaluated: {len(eligible_jobs)}. "
            "Applications stay in review until you submit them; no application is marked submitted here.",
            details={
                "submitted": applied_count,
                "prepared_for_review": queued_count,
                "skipped": skipped_jobs,
                "evaluated": len(eligible_jobs),
            },
        )

        return {
            "status": "completed",
            "applied": applied_count,
            "queued": queued_count,
            "evaluated": len(eligible_jobs),
            "quota_remaining": max(0, remaining_quota - (applied_count + queued_count))
        }

agent_console = AgentConsoleService()
