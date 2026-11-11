from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class JobBase(BaseModel):
    source: str
    external_job_id: str
    canonical_url: Optional[str] = None
    company: str
    title: str
    location: Optional[str] = None
    country: Optional[str] = None
    work_mode: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: Optional[str] = None
    salary_period: Optional[str] = None
    experience: Optional[str] = None
    description: str
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    skills: Optional[str] = None
    posted_at: Optional[datetime] = None
    application_url: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    status: Optional[str] = None

class JobResponse(JobBase):
    id: int
    discovered_at: datetime
    status: str
    skills_list: Optional[List[str]] = None
    matched_skills: Optional[List[str]] = None
    match_score: Optional[float] = None

    class Config:
        from_attributes = True

class SkillCount(BaseModel):
    skill: str
    count: int
