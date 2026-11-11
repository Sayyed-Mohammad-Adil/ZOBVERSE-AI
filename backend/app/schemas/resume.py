from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeBase(BaseModel):
    filename: str
    original_name: str
    file_type: str
    is_default: Optional[bool] = False

class ResumeCreate(ResumeBase):
    pass

class ResumeUpdate(BaseModel):
    is_default: Optional[bool] = None
    parsed_content: Optional[str] = None

class ResumeResponse(ResumeBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
