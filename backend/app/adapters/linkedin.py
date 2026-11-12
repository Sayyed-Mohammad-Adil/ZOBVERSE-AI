import logging
import hashlib
import re
from typing import List, Dict, Any
import httpx
from bs4 import BeautifulSoup
from app.adapters.base import JobSourceAdapter
from app.adapters.http import get_with_retries

logger = logging.getLogger(__name__)

class LinkedInAdapter(JobSourceAdapter):
    def __init__(self):
        self.source_name = "LINKEDIN"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        }

    async def search_jobs(self, query: str, location: str = "remote", **kwargs) -> List[Dict[str, Any]]:
        logger.info(f"Searching LinkedIn for '{query}' in '{location}'")
        jobs: List[Dict[str, Any]] = []
        skills = kwargs.get("skills")
        skill_terms = (
            [skill.strip() for skill in skills.split(",") if skill.strip()]
            if isinstance(skills, str)
            else []
        )
        keywords = query
        for skill in skill_terms[:2]:
            if skill.lower() not in keywords.lower():
                keywords = f"{keywords} {skill}".strip()
        
        url = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
        params = {
            "keywords": keywords,
            "location": location,
            "start": kwargs.get("start", 0),
        }
        
        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=15.0) as client:
                response = await get_with_retries(
                    client,
                    url,
                    params=params,
                    provider=self.source_name,
                )
                response.raise_for_status()
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, "html.parser")
                    cards = soup.find_all("li")
                    for card in cards:
                        try:
                            link_tag = card.find("a", class_="base-card__full-link")
                            if not link_tag or not link_tag.get("href"):
                                link_tag = card.find("a")
                            job_url = link_tag["href"].strip() if link_tag and link_tag.get("href") else ""
                            if not job_url:
                                continue

                            urn_attr = card.find("div", {"data-entity-urn": True})
                            if urn_attr:
                                urn = urn_attr["data-entity-urn"]
                                ext_id = urn.split(":")[-1]
                            else:
                                match = re.search(r"view/(\d+)", job_url)
                                ext_id = match.group(1) if match else hashlib.sha256(
                                    job_url.encode("utf-8")
                                ).hexdigest()

                            title_tag = card.find("h3", class_="base-search-card__title") or card.find("h3")
                            title = title_tag.get_text(strip=True) if title_tag else ""

                            company_tag = card.find("h4", class_="base-search-card__subtitle") or card.find("h4")
                            company = company_tag.get_text(strip=True) if company_tag else ""
                            if not title or not company:
                                continue

                            loc_tag = card.find("span", class_="job-search-card__location")
                            loc = loc_tag.get_text(strip=True) if loc_tag else ""
                            posted_tag = card.find("time")

                            jobs.append({
                                "external_job_id": f"li_{ext_id}",
                                "title": title,
                                "company": company,
                                "location": loc,
                                "description": "",
                                "url": job_url,
                                "source": self.source_name,
                                "salary_min": None,
                                "salary_max": None,
                                "salary_currency": None,
                                "salary_period": None,
                                "experience": None,
                                "work_mode": (
                                    "Remote" if "remote" in loc.lower() else None
                                ),
                                "posted_at": (
                                    posted_tag.get("datetime")
                                    if posted_tag
                                    else None
                                ),
                            })
                        except Exception as parse_err:
                            logger.debug(f"Failed parsing single LinkedIn card: {parse_err}")
                            continue
        except Exception as e:
            logger.warning("Live LinkedIn request failed: %s", e)
            raise RuntimeError(f"LinkedIn live search request failed: {e}") from e

        if not jobs:
            logger.info(f"No live LinkedIn job cards parsed for '{query}' in '{location}'.")
            
        logger.info(f"Discovered {len(jobs)} live jobs from LinkedIn")
        return jobs

    async def get_job_details(self, external_job_id: str) -> Dict[str, Any]:
        raise NotImplementedError("LinkedIn job details are only available from search results.")

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
            "salary_period": raw_job.get("salary_period"),
            "experience": raw_job.get("experience"),
            "posted_at": raw_job.get("posted_at"),
            "work_mode": raw_job.get("work_mode"),
        }

    async def get_application_method(self, external_job_id: str) -> str:
        return "EASY_APPLY"

    async def supports_automation(self) -> bool:
        return True

    async def requires_human_action(self, external_job_id: str) -> bool:
        return False

    async def prepare_application(self, external_job_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        return {"status": "prepared", "method": "EASY_APPLY", "data": profile_data}

    async def track_application(self, external_job_id: str) -> str:
        raise NotImplementedError("LinkedIn application status is not available from public search.")
