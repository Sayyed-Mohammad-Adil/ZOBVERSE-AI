import asyncio
import json
import logging
from typing import Optional
from fastapi import APIRouter, Depends, Query, BackgroundTasks, Request, HTTPException

from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db, AsyncSessionLocal
from app.models.user import User
from app.models.profile import CandidateProfile
from app.services.agent_console import agent_console
from app.core.security import get_current_user
from app.workers.job_discovery import run_discovery

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/scan")
async def trigger_job_scan(
    current_user: User = Depends(get_current_user),
    query: Optional[str] = Query(default=None),
    skills: Optional[str] = Query(default=None, description="Target skills to discover, e.g. 'Python, FastAPI, Docker'"),
    location: str = Query(default="Remote"),
    source: Optional[str] = Query(default=None, description="Limit discovery to LinkedIn or Jobicy"),
    db: AsyncSession = Depends(get_db)
):
    """Fetch live listings now and associate discovered jobs with the signed-in user."""
    user_id = current_user.id
    if source and source.lower() not in {"linkedin", "jobicy"}:
        raise HTTPException(status_code=422, detail="Source must be LinkedIn or Jobicy.")

    profile_result = await db.execute(
        select(CandidateProfile).where(CandidateProfile.user_id == user_id)
    )
    profile = profile_result.scalars().first()
    effective_skills = skills.strip() if skills and skills.strip() else (
        profile.skills if profile and profile.skills else None
    )
    effective_query = (
        query.strip() if query and query.strip()
        else (profile.current_role if profile and profile.current_role else "Software Engineer")
    )

    skills_text = f" (CV skills: {effective_skills})" if effective_skills else ""
    source_text = f" on {source}" if source else " on LinkedIn and Jobicy"
    await agent_console.broadcast_log(
        user_id=user_id,
        level="DISCOVERY",
        stage="SCRAPER",
        message=f"🌐 Searching live job boards{source_text} for '{effective_query}'{skills_text} in '{location}'...",
        details={"query": effective_query, "skills": effective_skills, "location": location, "source": source}
    )

    try:
        discovery = await run_discovery(
            db,
            query=effective_query,
            location=location,
            requested_skills=effective_skills,
            source=source,
            user_id=user_id,
        )
    except Exception as exc:
        logger.exception("Live job discovery failed for user %s", user_id)
        raise HTTPException(
            status_code=502,
            detail=f"Live job search failed: {exc}",
        ) from exc

    if discovery["fetched"] == 0 and discovery["errors"]:
        raise HTTPException(
            status_code=502,
            detail="Live job providers could not return listings: "
            + "; ".join(discovery["errors"]),
        )

    fetched = discovery["fetched"]
    await agent_console.broadcast_log(
        user_id=user_id,
        level="SUCCESS" if fetched else "WARN",
        stage="SCRAPER",
        message=(
            f"✅ Live search fetched {fetched} listings; "
            f"{discovery['newly_saved']} new listings saved to your account."
            if fetched
            else "No live listings matched this search. Try another role, skill, or location."
        ),
        details=discovery,
    )

    return {
        "message": (
            f"Live search fetched {fetched} listings."
            if fetched
            else "No live listings matched this search."
        ),
        "query": effective_query,
        "skills": effective_skills,
        "source": source,
        **discovery,
    }


@router.get("/logs/{user_id}")
async def get_console_logs(
    user_id: int,
    limit: int = Query(default=100),
    current_user: User = Depends(get_current_user),
):
    """Fetch cached log entries for user console."""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot view another user's worker logs.")
    logs = agent_console.get_logs(user_id=user_id, limit=limit)
    return {"logs": logs, "count": len(logs)}

@router.post("/clear-logs/{user_id}")
async def clear_console_logs(
    user_id: int,
    current_user: User = Depends(get_current_user),
):
    """Clear in-memory console buffer for user."""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot clear another user's worker logs.")
    agent_console.clear_logs(user_id=user_id)
    await agent_console.broadcast_log(
        user_id=user_id,
        level="INFO",
        stage="DAEMON",
        message="🧹 Console log buffer reset by user.",
        details={}
    )
    return {"status": "cleared"}

async def _execute_auto_apply_cycle(user_id: int, max_apply: int, min_score: int):
    """Background execution for auto-apply cycle with fresh DB session."""
    async with AsyncSessionLocal() as session:
        try:
            await agent_console.run_auto_apply_cycle(
                db=session,
                user_id=user_id,
                max_apply=max_apply,
                min_score=min_score
            )
        except Exception as e:
            logger.error(f"Error executing auto apply cycle for user {user_id}: {e}", exc_info=True)
            await agent_console.broadcast_log(
                user_id=user_id,
                level="ERROR",
                stage="DAEMON",
                message=f"❌ Auto-Apply Cycle Failed: {str(e)}",
                details={"error": str(e)}
            )

@router.post("/auto-apply/{user_id}")
async def trigger_auto_apply(
    user_id: int,
    max_apply: int = Query(default=5, ge=1, le=25),
    min_score: int = Query(default=40, ge=10, le=100),
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
):
    """Trigger real-time auto-apply execution cycle."""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot trigger actions for another user.")
    asyncio.create_task(_execute_auto_apply_cycle(user_id, max_apply, min_score))
    return {
        "status": "started",
        "message": f"Auto-apply cycle launched for candidate #{user_id}",
        "max_apply": max_apply,
        "min_score": min_score
    }

@router.get("/stream/{user_id}")
async def stream_console_logs(
    request: Request,
    user_id: int,
    current_user: User = Depends(get_current_user),
):
    """Server-Sent Events (SSE) live log stream for real-time Agent Console."""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot subscribe to another user's worker logs.")
    queue = agent_console.subscribe(user_id)

    async def event_generator():
        try:
            # Yield initial connection confirmation
            welcome = {
                "id": f"conn_{user_id}",
                "level": "INFO",
                "stage": "DAEMON",
                "message": "Live log stream connected. This does not confirm the worker is running.",
                "details": {"status": "CONNECTED"}
            }
            yield f"data: {json.dumps(welcome)}\n\n"

            while True:
                # Disconnect if client closed connection
                if await request.is_disconnected():
                    break
                try:
                    # Wait up to 12s for next log entry
                    log_item = await asyncio.wait_for(queue.get(), timeout=12.0)
                    yield f"data: {json.dumps(log_item)}\n\n"
                except asyncio.TimeoutError:
                    # Keepalive ping comment
                    yield ": ping\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            agent_console.unsubscribe(user_id, queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
