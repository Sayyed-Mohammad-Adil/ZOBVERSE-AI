from pydantic import BaseModel, Field
from typing import Optional, List

class CandidatePreferencesBase(BaseModel):
    target_salary: Optional[float] = None
    minimum_salary: Optional[float] = None
    currency: Optional[str] = "USD"
    salary_period: Optional[str] = "Annual"
    
    preferred_roles: Optional[List[str]] = None
    excluded_roles: Optional[List[str]] = None
    preferred_locations: Optional[List[str]] = None
    job_sources: List[str] = Field(default_factory=lambda: ["linkedin", "jobicy"])
    
    remote_only: Optional[bool] = False
    willing_to_relocate: Optional[bool] = False
    
    daily_application_limit: Optional[int] = Field(default=10, ge=1, le=500)
    automation_mode: Optional[str] = "Assisted"

class CandidatePreferencesCreate(CandidatePreferencesBase):
    pass

class CandidatePreferencesUpdate(CandidatePreferencesBase):
    pass

class CandidatePreferencesResponse(CandidatePreferencesBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
