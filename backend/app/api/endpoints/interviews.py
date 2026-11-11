from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.models.interview import Interview
from app.models.application import Application
from app.models.audit_log import AuditLog

router = APIRouter()

class InterviewCreate(BaseModel):
    application_id: Optional[int] = None
    company: str
    role: str
    interview_date: datetime
    round: str = "Technical"
    interviewer: Optional[str] = None
    notes: Optional[str] = None
    feedback: Optional[str] = None
    next_step: Optional[str] = None
    reminder_set: bool = True

class InterviewUpdate(BaseModel):
    round: Optional[str] = None
    interview_date: Optional[datetime] = None
    interviewer: Optional[str] = None
    notes: Optional[str] = None
    feedback: Optional[str] = None
    next_step: Optional[str] = None
    reminder_set: Optional[bool] = None

class InterviewResponse(BaseModel):
    id: int
    application_id: Optional[int]
    user_id: int
    company: str
    role: str
    interview_date: datetime
    round: str
    interviewer: Optional[str]
    notes: Optional[str]
    feedback: Optional[str]
    next_step: Optional[str]
    reminder_set: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

@router.get("/{user_id}", response_model=List[InterviewResponse])
async def get_interviews(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Interview).where(Interview.user_id == user_id).order_by(Interview.interview_date.asc())
    )
    return result.scalars().all()

@router.post("/{user_id}", response_model=InterviewResponse)
async def create_interview(user_id: int, payload: InterviewCreate, db: AsyncSession = Depends(get_db)):
    interview = Interview(
        user_id=user_id,
        application_id=payload.application_id,
        company=payload.company,
        role=payload.role,
        interview_date=payload.interview_date,
        round=payload.round,
        interviewer=payload.interviewer,
        notes=payload.notes,
        feedback=payload.feedback,
        next_step=payload.next_step,
        reminder_set=payload.reminder_set
    )
    db.add(interview)

    # If linked to application, automatically advance status to INTERVIEW
    if payload.application_id:
        app_res = await db.execute(select(Application).where(Application.id == payload.application_id))
        app = app_res.scalar_one_or_none()
        if app and app.status != "INTERVIEW":
            app.status = "INTERVIEW"
            if not app.history:
                app.history = []
            app.history = list(app.history) + [{"status": "INTERVIEW", "timestamp": datetime.utcnow().isoformat(), "notes": f"Interview scheduled: {payload.round}"}]

    # Log to audit log
    audit = AuditLog(
        user_id=user_id,
        action="CREATE_INTERVIEW",
        service="interview_tracker",
        details=f"Scheduled {payload.round} interview with {payload.company} for {payload.role}"
    )
    db.add(audit)

    await db.commit()
    await db.refresh(interview)
    return interview

@router.put("/{interview_id}", response_model=InterviewResponse)
async def update_interview(interview_id: int, payload: InterviewUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Interview).where(Interview.id == interview_id))
    interview = res.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    for field, val in payload.dict(exclude_unset=True).items():
        setattr(interview, field, val)

    await db.commit()
    await db.refresh(interview)
    return interview

@router.delete("/{interview_id}")
async def delete_interview(interview_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Interview).where(Interview.id == interview_id))
    interview = res.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    await db.delete(interview)
    await db.commit()
    return {"message": "Interview deleted successfully"}
