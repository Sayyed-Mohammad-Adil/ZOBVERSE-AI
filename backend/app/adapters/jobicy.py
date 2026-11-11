import logging
from typing import List, Dict, Any
import httpx
from app.adapters.base import JobSourceAdapter

logger = logging.getLogger(__name__)

class JobicyAdapter(JobSourceAdapter):
    def __init__(self):
        self.source_name = "JOBICY"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "application/json",
        }

    async def search_jobs(self, query: str, location: str = "remote", **kwargs) -> List[Dict[str, Any]]:
        logger.info(f"Searching Jobicy for '{query}' in '{location}'")
        jobs: List[Dict[str, Any]] = []

        try:
            skills = kwargs.get("skills")
            first_skill = (
                skills.split(",")[0].strip()
                if isinstance(skills, str) and skills.strip()
                else ""
            )
            tag = first_skill.lower().replace(" ", "-") or (
                query.lower().split()[0] if query else "python"
            )
            url = f"https://jobicy.com/api/v2/remote-jobs?count=10&tag={tag}"

            async with httpx.AsyncClient(headers=self.headers, timeout=12.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    for item in data.get("jobs", []):
                        job_id = str(item.get("id", ""))
                        title = (item.get("jobTitle") or "").strip()
                        company = (item.get("companyName") or "").strip()
                        desc = (item.get("jobExcerpt") or item.get("jobDescription") or "").strip()
                        job_url = (item.get("url") or "").strip()
                        salary_min = item.get("annualSalaryMin")
                        salary_max = item.get("annualSalaryMax")
                        currency = item.get("salaryCurrency")

                        if not job_id or not title or not company or not job_url:
                            logger.debug("Skipping Jobicy listing with missing source fields")
                            continue

                        job_location = (item.get("jobGeo") or "").strip()
                        jobs.append({
                            "external_job_id": f"jobicy_{job_id}",
                            "title": title,
                            "company": company,
                            "location": job_location,
                            "description": desc,
                            "url": job_url,
                            "source": self.source_name,
                            "salary_min": float(salary_min) if salary_min else None,
                            "salary_max": float(salary_max) if salary_max else None,
                            "salary_currency": currency,
                            "work_mode": "Remote",
                        })
        except Exception as e:
            logger.warning(f"Live Jobicy API query failed: {e}. Returning no results.")

        if not jobs:
            logger.info(f"No live Jobicy jobs returned for '{query}' in '{location}'.")

        logger.info(f"Discovered {len(jobs)} live jobs from Jobicy")
        return jobs

    async def get_job_details(self, external_job_id: str) -> Dict[str, Any]:
        raise NotImplementedError("Jobicy job details are only available from search results.")

    async def normalize_job(self, raw_job: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "external_job_id": raw_job["external_job_id"],
            "title": raw_job["title"].strip(),
            "company": raw_job["company"].strip(),
            "location": raw_job.get("location", "").strip(),
            "description": raw_job.get("description", "").strip(),
            "url": raw_job.get("url", ""),
            "source": self.source_name,
            "salary_min": raw_job.get("salary_min"),
            "salary_max": raw_job.get("salary_max"),
            "salary_currency": raw_job.get("salary_currency"),
            "work_mode": raw_job.get("work_mode"),
        }

    async def get_application_method(self, external_job_id: str) -> str:
        return "EXTERNAL" # External company application portal

    async def supports_automation(self) -> bool:
        return False # External redirects require manual human actions per Task.md

    async def requires_human_action(self, external_job_id: str) -> bool:
        return True # Strict compliance with Rule 2: Pause and request human action

    async def prepare_application(self, external_job_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "status": "requires_manual",
            "method": "EXTERNAL",
            "notes": "External company portal requires candidate direct submission",
            "data": profile_data
        }

    async def track_application(self, external_job_id: str) -> str:
        raise NotImplementedError("Jobicy does not provide application status tracking.")
