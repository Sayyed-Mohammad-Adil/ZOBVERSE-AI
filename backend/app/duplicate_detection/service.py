import hashlib
import re
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.job import Job
from app.models.application import Application

class DuplicateDetectionService:
    @staticmethod
    def compute_hash(text: str) -> str:
        cleaned = re.sub(r'\s+', ' ', (text or '').lower().strip())
        return hashlib.sha256(cleaned.encode('utf-8')).hexdigest()

    async def evaluate_job(
        self,
        db: AsyncSession,
        external_job_id: Optional[str] = None,
        canonical_url: Optional[str] = None,
        company: Optional[str] = None,
        title: Optional[str] = None,
        description: Optional[str] = None,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Multi-tier duplicate detection enforcing Task.md Section 39:
        - Exact duplicate (external_id, canonical_url, description hash)
        - Probable duplicate (normalized company + title)
        - Application history collision (already applied)
        """
        # Tier 1: Check by External Job ID
        if external_job_id:
            res = await db.execute(select(Job).where(Job.external_job_id == external_job_id))
            match = res.scalars().first()
            if match:
                return {
                    "state": "EXACT_DUPLICATE",
                    "is_duplicate": True,
                    "confidence": 1.0,
                    "reason": f"Exact external job ID match '{external_job_id}' found.",
                    "matched_job_id": match.id
                }

        # Tier 2: Check by Canonical URL
        if canonical_url:
            res = await db.execute(select(Job).where(Job.canonical_url == canonical_url))
            match = res.scalars().first()
            if match:
                return {
                    "state": "EXACT_DUPLICATE",
                    "is_duplicate": True,
                    "confidence": 1.0,
                    "reason": "Exact canonical URL match found.",
                    "matched_job_id": match.id
                }

        # Tier 3: Check by Description Hash
        if description and len(description.strip()) > 50:
            desc_hash = self.compute_hash(description)
            res = await db.execute(select(Job).where(Job.description_hash == desc_hash))
            match = res.scalars().first()
            if match:
                return {
                    "state": "EXACT_DUPLICATE",
                    "is_duplicate": True,
                    "confidence": 0.98,
                    "reason": "Job description text content hash matches existing post.",
                    "matched_job_id": match.id
                }

        # Tier 4: Check by normalized Title & Company
        if company and title:
            norm_comp = company.strip().lower()
            norm_title = title.strip().lower()
            res = await db.execute(
                select(Job).where(Job.company.ilike(norm_comp)).where(Job.title.ilike(norm_title))
            )
            match = res.scalars().first()
            if match:
                return {
                    "state": "PROBABLE_DUPLICATE",
                    "is_duplicate": True,
                    "confidence": 0.88,
                    "reason": f"Same title '{title}' at '{company}' already exists in database.",
                    "matched_job_id": match.id
                }

        # Tier 5: Check Application History (Candidate already applied)
        if user_id and company and title:
            app_res = await db.execute(
                select(Application, Job)
                .join(Job, Application.job_id == Job.id)
                .where(Application.user_id == user_id)
                .where(Job.company.ilike(company.strip().lower()))
                .where(Job.title.ilike(title.strip().lower()))
            )
            existing_app = app_res.first()
            if existing_app:
                return {
                    "state": "ALREADY_APPLIED",
                    "is_duplicate": True,
                    "confidence": 1.0,
                    "reason": "Candidate has already applied to this company and role.",
                    "matched_job_id": existing_app[1].id
                }

        return {
            "state": "DIFFERENT",
            "is_duplicate": False,
            "confidence": 1.0,
            "reason": "Unique opportunity. No matching job or prior application found.",
            "matched_job_id": None
        }
