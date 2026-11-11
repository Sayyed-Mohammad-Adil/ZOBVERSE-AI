from pydantic import BaseModel, field_validator
from typing import Optional, List, Union

class CandidateProfileBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    current_role: Optional[str] = None
    total_experience_years: Optional[int] = None
    summary: Optional[str] = None
    skills: Optional[Union[str, List[str]]] = None

    @field_validator("skills", mode="before")
    def convert_skills(cls, v):
        if isinstance(v, list):
            return ", ".join(v)
        return v


class CandidateProfileCreate(CandidateProfileBase):
    pass

class CandidateProfileUpdate(CandidateProfileBase):
    pass

class CandidateProfileResponse(CandidateProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
