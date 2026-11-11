from datetime import datetime
from pydantic import BaseModel


class PlatformJob(BaseModel):
    external_job_id: str
    title: str
    company: str
    location: str | None = None
    salary_min: float | None = None
    salary_max: float | None = None
    salary_currency: str | None = None
    salary_period: str | None = None
    experience: str | None = None
    description: str = ""
    requirements: str | None = None
    responsibilities: str | None = None
    url: str
    source: str
    work_mode: str | None = None
    posted_at: datetime | None = None
