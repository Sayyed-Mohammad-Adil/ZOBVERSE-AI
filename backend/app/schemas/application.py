from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union
from datetime import datetime

class ApplicationBase(BaseModel):
    job_id: int
    resume_id: Optional[int] = None
    status: Optional[str] = "READY"
    notes: Optional[str] = None
    
class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class ApplicationResponse(ApplicationBase):
    id: int
    user_id: int
    job_title: Optional[str] = None
    job_company: Optional[str] = None
    job_location: Optional[str] = None
    job_source: Optional[str] = None
    applied_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    history: Optional[Any] = None

    class Config:
        from_attributes = True
