from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.models.offer import Offer
from app.models.application import Application
from app.models.audit_log import AuditLog

router = APIRouter()

class OfferCreate(BaseModel):
    application_id: Optional[int] = None
    company: str
    role: str
    base_salary: float
    bonus: Optional[float] = None
    equity: Optional[str] = None
    currency: str = "USD"
    location: Optional[str] = None
    work_mode: Optional[str] = None
    joining_date: Optional[datetime] = None
    status: str = "PENDING"
    notes: Optional[str] = None

class OfferUpdate(BaseModel):
    base_salary: Optional[float] = None
    bonus: Optional[float] = None
    equity: Optional[str] = None
    currency: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    joining_date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class OfferResponse(BaseModel):
    id: int
    application_id: Optional[int]
    user_id: int
    company: str
    role: str
    base_salary: float
    bonus: Optional[float]
    equity: Optional[str]
    currency: str
    location: Optional[str]
    work_mode: Optional[str]
    joining_date: Optional[datetime]
    status: str
    notes: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

@router.get("/{user_id}", response_model=List[OfferResponse])
async def get_offers(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Offer).where(Offer.user_id == user_id).order_by(Offer.created_at.desc())
    )
    return result.scalars().all()

@router.post("/{user_id}", response_model=OfferResponse)
async def create_offer(user_id: int, payload: OfferCreate, db: AsyncSession = Depends(get_db)):
    offer = Offer(
        user_id=user_id,
        application_id=payload.application_id,
        company=payload.company,
        role=payload.role,
        base_salary=payload.base_salary,
        bonus=payload.bonus,
        equity=payload.equity,
        currency=payload.currency,
        location=payload.location,
        work_mode=payload.work_mode,
        joining_date=payload.joining_date,
        status=payload.status,
        notes=payload.notes
    )
    db.add(offer)

    # If linked to application, automatically advance status to OFFER
    if payload.application_id:
        app_res = await db.execute(select(Application).where(Application.id == payload.application_id))
        app = app_res.scalar_one_or_none()
        if app and app.status != "OFFER":
            app.status = "OFFER"
            if not app.history:
                app.history = []
            app.history = list(app.history) + [{"status": "OFFER", "timestamp": datetime.utcnow().isoformat(), "notes": f"Offer received: {payload.base_salary} {payload.currency}"}]

    audit = AuditLog(
        user_id=user_id,
        action="RECORD_OFFER",
        service="offer_tracker",
        details=f"Received offer from {payload.company} for {payload.role}: {payload.base_salary} {payload.currency}"
    )
    db.add(audit)

    await db.commit()
    await db.refresh(offer)
    return offer

@router.put("/{offer_id}", response_model=OfferResponse)
async def update_offer(offer_id: int, payload: OfferUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Offer).where(Offer.id == offer_id))
    offer = res.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    for field, val in payload.dict(exclude_unset=True).items():
        setattr(offer, field, val)

    await db.commit()
    await db.refresh(offer)
    return offer

@router.delete("/{offer_id}")
async def delete_offer(offer_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Offer).where(Offer.id == offer_id))
    offer = res.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    await db.delete(offer)
    await db.commit()
    return {"message": "Offer deleted successfully"}
