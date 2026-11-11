from pydantic import BaseModel
from typing import Dict, Any

class MatchResult(BaseModel):
    job_id: int
    score: float
    skills_match: float
    experience_match: float
    location_match: float
    salary_match: float
    role_match: float
    industry_match: float
    matched_skills: list[str]
    missing_skills: list[str]
    potential_concerns: list[str]
    explanation: str

class MatchRequest(BaseModel):
    job_id: int
    resume_id: int
