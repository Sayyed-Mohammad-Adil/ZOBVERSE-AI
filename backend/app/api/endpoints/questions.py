from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.core.database import get_db
from app.models.question import Question
from app.models.profile import CandidateProfile
from app.ai.laya.decision import LayaDecisionService
from pydantic import BaseModel

router = APIRouter()

class QuestionCreate(BaseModel):
    question_text: str
    answer_text: str
    category: str = "TECHNICAL"
    confidence_score: Optional[float] = 1.0
    source: Optional[str] = "User confirmed"

class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    answer_text: Optional[str] = None
    category: Optional[str] = None
    confidence_score: Optional[float] = None
    source: Optional[str] = None

class QuestionClassifyRequest(BaseModel):
    user_id: int
    question_text: str

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    answer_text: str
    category: str
    confidence_score: Optional[float] = 1.0
    source: Optional[str] = "User confirmed"

    class Config:
        from_attributes = True

@router.get("/{user_id}", response_model=List[QuestionResponse])
async def get_questions(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Question).where(Question.user_id == user_id).order_by(Question.created_at.desc()))
    return result.scalars().all()

@router.post("/{user_id}", response_model=QuestionResponse)
async def create_question(user_id: int, q: QuestionCreate, db: AsyncSession = Depends(get_db)):
    new_q = Question(
        user_id=user_id,
        question_text=q.question_text,
        answer_text=q.answer_text,
        category=q.category,
        confidence_score=q.confidence_score or 1.0,
        source=q.source or "User confirmed"
    )
    db.add(new_q)
    await db.commit()
    await db.refresh(new_q)
    return new_q

@router.put("/{question_id}", response_model=QuestionResponse)
async def update_question(question_id: int, q: QuestionUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Question).where(Question.id == question_id))
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    for field, val in q.dict(exclude_unset=True).items():
        setattr(question, field, val)

    await db.commit()
    await db.refresh(question)
    return question

@router.delete("/{question_id}")
async def delete_question(question_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Question).where(Question.id == question_id))
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    await db.delete(question)
    await db.commit()
    return {"message": "Question deleted successfully"}

@router.post("/classify")
async def classify_question(req: QuestionClassifyRequest, db: AsyncSession = Depends(get_db)):
    """Classifies a screening question using Laya and checks if profile has an answer"""
    # Check if we already have an exact or close answer saved
    result = await db.execute(
        select(Question).where(Question.user_id == req.user_id)
    )
    saved = result.scalars().all()
    for item in saved:
        if req.question_text.lower() in item.question_text.lower() or item.question_text.lower() in req.question_text.lower():
            return {
                "category": item.category,
                "suggested_answer": item.answer_text,
                "confidence": item.confidence_score or 0.95,
                "source": "Saved answer bank",
                "requires_human_input": False
            }

    # Fetch candidate profile to check if profile has facts to answer
    prof_res = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == req.user_id))
    profile = prof_res.scalar_one_or_none()

    laya = LayaDecisionService()
    classification = await laya.classify_screening_question(req.question_text)
    
    # Check profile attributes
    suggested_answer = ""
    confidence = 0.5
    source = "Unknown"
    requires_input = True

    q_lower = req.question_text.lower()
    if profile:
        if "year" in q_lower or "experience" in q_lower:
            suggested_answer = f"{profile.total_experience_years or 0} years"
            confidence = 0.98
            source = "Candidate profile -> CV"
            requires_input = False
        elif "role" in q_lower or "title" in q_lower:
            suggested_answer = profile.current_role or ""
            confidence = 0.95
            source = "Candidate profile -> Current Role"
            requires_input = not bool(profile.current_role)
        elif "phone" in q_lower or "contact" in q_lower:
            suggested_answer = profile.phone or ""
            confidence = 0.99
            source = "Candidate profile -> Phone"
            requires_input = not bool(profile.phone)

    return {
        "category": classification.get("category", "TECHNICAL"),
        "suggested_answer": suggested_answer,
        "confidence": confidence,
        "source": source,
        "requires_human_input": requires_input
    }
