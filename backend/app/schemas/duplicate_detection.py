from pydantic import BaseModel
from typing import Optional

class DuplicateCheckRequest(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    external_url: Optional[str] = None

class DuplicateCheckResult(BaseModel):
    is_duplicate: bool
    confidence: float
    reason: str
    matched_job_id: Optional[int] = None
