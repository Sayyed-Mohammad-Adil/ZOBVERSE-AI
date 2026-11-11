from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.duplicate_detection import DuplicateCheckRequest, DuplicateCheckResult
from app.duplicate_detection.service import DuplicateDetectionService

router = APIRouter()
dupe_service = DuplicateDetectionService()

@router.post("/check", response_model=DuplicateCheckResult)
async def check_duplicate(req: DuplicateCheckRequest, db: AsyncSession = Depends(get_db)):
    result = await dupe_service.evaluate_job(
        db=db,
        company=req.company,
        title=req.title,
        description=req.description
    )
    return DuplicateCheckResult(
        is_duplicate=result["is_duplicate"],
        confidence=result["confidence"],
        reason=result["reason"],
        matched_job_id=result.get("matched_job_id")
    )

