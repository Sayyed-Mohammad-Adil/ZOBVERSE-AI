from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.database import get_db
from app.models.notification import Notification
from pydantic import BaseModel
import datetime

router = APIRouter()

class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: datetime.datetime
    
    class Config:
        orm_mode = True

@router.get("/{user_id}", response_model=List[NotificationResponse])
async def get_notifications(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(20)
    )
    return result.scalars().all()

@router.put("/{notification_id}/read")
async def mark_read(notification_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).where(Notification.id == notification_id))
    notification = result.scalars().first()
    if notification:
        notification.is_read = True
        await db.commit()
    return {"status": "ok"}
