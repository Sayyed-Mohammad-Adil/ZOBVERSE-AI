from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.preferences import CandidatePreferences
from app.schemas.preferences import CandidatePreferencesCreate, CandidatePreferencesUpdate, CandidatePreferencesResponse
from typing import Any

router = APIRouter()

@router.get("/{user_id}", response_model=CandidatePreferencesResponse)
async def get_preferences(user_id: int, db: AsyncSession = Depends(get_db)) -> Any:
    result = await db.execute(select(CandidatePreferences).where(CandidatePreferences.user_id == user_id))
    preferences = result.scalars().first()
    if not preferences:
        # Create default preferences so frontend forms have clean initial state
        preferences = CandidatePreferences(
            user_id=user_id,
            currency="USD",
            salary_period="Annual",
            daily_application_limit=10,
            automation_mode="Assisted"
        )
        db.add(preferences)
        await db.commit()
        await db.refresh(preferences)
    return preferences

@router.put("/{user_id}", response_model=CandidatePreferencesResponse)
@router.post("/{user_id}", response_model=CandidatePreferencesResponse)
async def upsert_preferences(user_id: int, preferences_in: CandidatePreferencesUpdate, db: AsyncSession = Depends(get_db)) -> Any:
    result = await db.execute(select(CandidatePreferences).where(CandidatePreferences.user_id == user_id))
    preferences = result.scalars().first()
    
    update_data = preferences_in.model_dump(exclude_unset=True)
    if preferences:
        for field, value in update_data.items():
            setattr(preferences, field, value)
    else:
        preferences = CandidatePreferences(user_id=user_id, **update_data)
        db.add(preferences)

    await db.commit()
    await db.refresh(preferences)
    return preferences

@router.post("/", response_model=CandidatePreferencesResponse)
async def create_preferences(user_id: int, preferences_in: CandidatePreferencesCreate, db: AsyncSession = Depends(get_db)) -> Any:
    return await upsert_preferences(user_id, preferences_in, db)

