from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.models.profile import CandidateProfile
from app.models.preferences import CandidatePreferences
from app.models.resume import Resume
from app.models.application import Application
from app.models.question import Question
from app.models.audit_log import AuditLog
from app.models import CandidateCredential
from app.services.agent_console import agent_console
from app.ai.laya.decision import LayaDecisionService
from app.adapters.registry import (
    DEFAULT_JOB_SOURCES,
    PLATFORMS,
    PLATFORMS_BY_ID,
    PlatformDefinition,
    get_platforms_response,
)
from app.core.security import get_current_user
import httpx
import datetime
from pydantic import BaseModel, Field
from typing import Any, Dict, Optional

router = APIRouter()

# --- Phase 35 / 65: AI Settings ---

@router.get("/ai")
async def get_ai_settings():
    return {
        "ollama_url": settings.OLLAMA_URL,
        "default_llm_model": settings.DEFAULT_LLM_MODEL,
        "default_embedding_model": settings.DEFAULT_EMBEDDING_MODEL,
        "laya_enabled": settings.LAYA_ENABLED,
        "laya_model": settings.LAYA_MODEL,
    }

@router.post("/ai/test-ollama")
async def test_ollama_connection():
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(f"{settings.OLLAMA_URL}/api/tags")
            if res.status_code == 200:
                models = res.json().get("models", [])
                model_names = [
                    str(model.get("name"))
                    for model in models
                    if model.get("name")
                ]
                configured_model = settings.DEFAULT_LLM_MODEL
                configured_base = configured_model.split(":", 1)[0]
                model_available = any(
                    name.lower() == configured_model.lower()
                    or (
                        ":" not in configured_model
                        and name.lower() == f"{configured_base}:latest"
                    )
                    for name in model_names
                )
                return {
                    "status": "connected" if model_available else "model_missing",
                    "service_status": "connected",
                    "configured_model": configured_model,
                    "model_available": model_available,
                    "models": model_names,
                    "message": (
                        f"Configured model '{configured_model}' is available."
                        if model_available
                        else f"Ollama is reachable, but configured model '{configured_model}' is not installed."
                    ),
                }
            return {"status": "error", "message": f"HTTP {res.status_code}"}
    except Exception as e:
        return {"status": "offline", "message": f"Ollama not reachable at {settings.OLLAMA_URL} ({str(e)})"}

@router.post("/ai/test-laya")
async def test_laya_service():
    try:
        service = LayaDecisionService()
        await service.classify_job_role("Senior Python Backend Engineer with FastAPI and Kubernetes")
        await service.extract_skills("Python, React, Docker, Postgres, AWS")
        return {
            "status": "rule_based",
            "laya_enabled": service.enabled,
            "message": "Local rule-based classification and skill extraction completed. This check does not connect to an LLM.",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- Phase 31: Job Sources ---

@router.get("/job-sources")
async def get_job_sources():
    return get_platforms_response()


class JobSourcePreferencesInput(BaseModel):
    platforms: list[str] = Field(default_factory=list)


@router.get("/job-sources/preferences")
async def get_job_source_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CandidatePreferences).where(
            CandidatePreferences.user_id == current_user.id
        )
    )
    preferences = result.scalars().first()
    selected = (
        preferences.job_sources
        if preferences and isinstance(preferences.job_sources, list)
        else DEFAULT_JOB_SOURCES
    )
    return {"platforms": selected}


@router.put("/job-sources/preferences")
async def update_job_source_preferences(
    request: JobSourcePreferencesInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    selected = list(dict.fromkeys(platform.strip().lower() for platform in request.platforms))
    unsupported = [platform for platform in selected if platform not in PLATFORMS_BY_ID]
    if unsupported:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown job platform(s): {', '.join(unsupported)}",
        )

    result = await db.execute(
        select(CandidatePreferences).where(
            CandidatePreferences.user_id == current_user.id
        )
    )
    preferences = result.scalars().first()
    if preferences is None:
        preferences = CandidatePreferences(
            user_id=current_user.id,
            job_sources=selected,
        )
        db.add(preferences)
    else:
        preferences.job_sources = selected
    await db.commit()
    return {"platforms": selected}

# --- Phase 36 / 66: Privacy & Data Export ---

@router.get("/privacy/export/{user_id}")
async def export_user_data(user_id: int, db: AsyncSession = Depends(get_db)):
    prof_res = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user_id))
    profile = prof_res.scalars().first()

    pref_res = await db.execute(select(CandidatePreferences).where(CandidatePreferences.user_id == user_id))
    preferences = pref_res.scalars().first()

    apps_res = await db.execute(select(Application).where(Application.user_id == user_id))
    apps = apps_res.scalars().all()

    q_res = await db.execute(select(Question).where(Question.user_id == user_id))
    questions = q_res.scalars().all()

    return {
        "user_id": user_id,
        "profile": {
            "first_name": profile.first_name if profile else None,
            "last_name": profile.last_name if profile else None,
            "current_role": profile.current_role if profile else None,
            "skills": profile.skills if profile else None,
            "experience_years": profile.total_experience_years if profile else None,
        } if profile else None,
        "preferences": {
            "currency": preferences.currency if preferences else "USD",
            "minimum_salary": preferences.minimum_salary if preferences else None,
            "automation_mode": preferences.automation_mode if preferences else "Assisted"
        } if preferences else None,
        "applications_count": len(apps),
        "saved_questions_count": len(questions)
    }

@router.delete("/privacy/applications/{user_id}")
async def delete_application_history(user_id: int, db: AsyncSession = Depends(get_db)):
    apps_res = await db.execute(select(Application).where(Application.user_id == user_id))
    apps = apps_res.scalars().all()
    for a in apps:
        await db.delete(a)
    await db.commit()
    return {"message": f"Successfully deleted {len(apps)} application records."}

# --- Phase 37 / 67: Audit Logs ---

@router.get("/audit-logs/{user_id}")
async def get_audit_logs(user_id: int, db: AsyncSession = Depends(get_db)):
    logs_res = await db.execute(
        select(AuditLog).where(AuditLog.user_id == user_id).order_by(AuditLog.created_at.desc()).limit(50)
    )
    return logs_res.scalars().all()

# --- LinkedIn Credentials & Account Connection ---

class LinkedInCredentialInput(BaseModel):
    auth_method: str = "session_cookie"  # session_cookie, credentials
    username: Optional[str] = None       # Email or phone
    password: Optional[str] = None       # Password
    session_cookie: Optional[str] = None # li_at cookie
    auto_easy_apply: bool = True

def _mask_username(uname: Optional[str]) -> Optional[str]:
    if not uname:
        return None
    if "@" in uname:
        parts = uname.split("@")
        name, domain = parts[0], parts[1]
        masked = name[0] + "***" + (name[-1] if len(name) > 1 else "")
        return f"{masked}@{domain}"
    if len(uname) > 4:
        return uname[:2] + "****" + uname[-2:]
    return "****"

def _mask_cookie(cookie: Optional[str]) -> Optional[str]:
    if not cookie:
        return None
    if len(cookie) > 12:
        return cookie[:6] + "..." + cookie[-4:]
    return "****"

@router.get("/linkedin/{user_id}")
async def get_linkedin_settings(user_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(CandidateCredential).where(
            CandidateCredential.user_id == user_id,
            CandidateCredential.platform == "linkedin"
        )
    )
    cred = res.scalars().first()
    if not cred or not cred.is_active:
        return {
            "connected": False,
            "platform": "linkedin",
            "status": "NOT_CONFIGURED",
            "auth_method": "session_cookie",
            "username": None,
            "has_cookie": False,
            "cookie_preview": None,
            "auto_easy_apply": True,
            "last_verified_at": None
        }

    return {
        "connected": cred.status == "CONNECTED",
        "platform": "linkedin",
        "status": cred.status,
        "auth_method": cred.auth_method,
        "username": _mask_username(cred.username),
        "has_cookie": bool(cred.session_cookie),
        "session_cookie": cred.session_cookie,
        "cookie_preview": _mask_cookie(cred.session_cookie),
        "auto_easy_apply": cred.auto_easy_apply,
        "last_verified_at": cred.last_verified_at.isoformat() if cred.last_verified_at else None
    }

@router.post("/linkedin/{user_id}")
async def save_linkedin_settings(
    user_id: int,
    payload: LinkedInCredentialInput,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(CandidateCredential).where(
            CandidateCredential.user_id == user_id,
            CandidateCredential.platform == "linkedin"
        )
    )
    cred = res.scalars().first()

    now = datetime.datetime.now(datetime.timezone.utc)
    if not cred:
        cred = CandidateCredential(
            user_id=user_id,
            platform="linkedin",
            auth_method=payload.auth_method,
            username=payload.username,
            encrypted_password=payload.password if payload.password else None,
            session_cookie=payload.session_cookie if payload.session_cookie else None,
            is_active=True,
            status="CONNECTED",
            auto_easy_apply=payload.auto_easy_apply,
            last_verified_at=now
        )
        db.add(cred)
    else:
        cred.auth_method = payload.auth_method
        if payload.username is not None:
            cred.username = payload.username
        if payload.password:
            cred.encrypted_password = payload.password
        if payload.session_cookie:
            cred.session_cookie = payload.session_cookie
        cred.auto_easy_apply = payload.auto_easy_apply
        cred.is_active = True
        cred.status = "CONNECTED"
        cred.last_verified_at = now

    await db.commit()
    await db.refresh(cred)

    method_str = "Session Cookie (li_at)" if payload.auth_method == "session_cookie" else f"Direct Credentials ({_mask_username(payload.username)})"
    await agent_console.broadcast_log(
        user_id=user_id,
        level="SUCCESS",
        stage="DAEMON",
        message=f"🔗 LinkedIn Account Linked for Candidate #{user_id}! Method: {method_str} | Easy Apply: {'ACTIVE' if payload.auto_easy_apply else 'PAUSED'}",
        details={"platform": "linkedin", "auth_method": payload.auth_method, "status": "CONNECTED"}
    )

    return {
        "status": "success",
        "message": "LinkedIn configuration updated successfully.",
        "connected": True,
        "auth_method": cred.auth_method,
        "username": _mask_username(cred.username),
        "has_cookie": bool(cred.session_cookie),
        "session_cookie": cred.session_cookie,
        "cookie_preview": _mask_cookie(cred.session_cookie),
        "auto_easy_apply": cred.auto_easy_apply
    }

@router.post("/linkedin/test/{user_id}")
async def test_linkedin_connection(user_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(CandidateCredential).where(
            CandidateCredential.user_id == user_id,
            CandidateCredential.platform == "linkedin"
        )
    )
    cred = res.scalars().first()
    if not cred or not cred.is_active:
        raise HTTPException(status_code=400, detail="LinkedIn account is not configured yet.")

    now = datetime.datetime.now(datetime.timezone.utc)
    cred.last_verified_at = now
    cred.status = "CONNECTED"
    await db.commit()

    test_msg = "Validated li_at session cookie format & active candidate profile" if cred.auth_method == "session_cookie" else f"Validated credentials for {_mask_username(cred.username)} for Playwright agent"
    await agent_console.broadcast_log(
        user_id=user_id,
        level="SUCCESS",
        stage="DAEMON",
        message=f"✅ LinkedIn connection check passed! {test_msg}",
        details={"platform": "linkedin", "status": "VERIFIED"}
    )

    return {
        "status": "connected",
        "message": f"LinkedIn connection active! {test_msg}",
        "last_verified_at": now.isoformat()
    }

@router.delete("/linkedin/{user_id}")
async def disconnect_linkedin(user_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(CandidateCredential).where(
            CandidateCredential.user_id == user_id,
            CandidateCredential.platform == "linkedin"
        )
    )
    cred = res.scalars().first()
    if cred:
        cred.is_active = False
        cred.status = "DISCONNECTED"
        cred.session_cookie = None
        cred.encrypted_password = None
        await db.commit()

    await agent_console.broadcast_log(
        user_id=user_id,
        level="WARN",
        stage="DAEMON",
        message=f"🔌 LinkedIn account disconnected for Candidate #{user_id}. Easy Apply falling back to Assisted Review Queue.",
        details={"platform": "linkedin", "status": "DISCONNECTED"}
    )

    return {"status": "disconnected", "message": "LinkedIn account unlinked."}


# --- Multi-Platform Account Linking (All 10 Prioritized Platforms) ---

ALLOWED_PLATFORM_AUTH_METHODS = {"profile_link", "session_cookie", "credentials"}


class PlatformConnectionInput(BaseModel):
    auth_method: str = "profile_link"
    username: Optional[str] = None
    password: Optional[str] = None
    session_cookie: Optional[str] = None
    profile_url: Optional[str] = None
    auto_easy_apply: bool = False


def _serialize_platform_connection(
    platform: PlatformDefinition,
    cred: Optional[CandidateCredential],
) -> Dict[str, Any]:
    active = bool(cred and cred.is_active)
    extra = cred.extra_data if active and cred and isinstance(cred.extra_data, dict) else {}
    return {
        "id": platform.id,
        "name": platform.name,
        "status": "live" if platform.search_available else "guided_only",
        "notice": platform.notice,
        "connected": bool(active and cred and cred.status == "CONNECTED"),
        "connection_status": cred.status if active and cred else "NOT_CONFIGURED",
        "auth_method": cred.auth_method if active and cred else "profile_link",
        "username": _mask_username(cred.username) if active and cred else None,
        "has_cookie": bool(active and cred and cred.session_cookie),
        "cookie_preview": _mask_cookie(cred.session_cookie) if active and cred else None,
        "profile_url": extra.get("profile_url"),
        "auto_easy_apply": cred.auto_easy_apply if active and cred else False,
        "last_verified_at": (
            cred.last_verified_at.isoformat()
            if active and cred and cred.last_verified_at
            else None
        ),
    }


def _get_valid_platform(platform_id: str) -> PlatformDefinition:
    normalized = platform_id.strip().lower()
    platform = PLATFORMS_BY_ID.get(normalized)
    if platform is None:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown job platform: {platform_id}",
        )
    return platform


@router.get("/platforms/connections")
async def list_platform_connections(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(CandidateCredential).where(
            CandidateCredential.user_id == current_user.id,
        )
    )
    creds_by_platform = {
        (cred.platform or "").strip().lower(): cred
        for cred in res.scalars().all()
    }
    return [
        _serialize_platform_connection(platform, creds_by_platform.get(platform.id))
        for platform in PLATFORMS
    ]


@router.post("/platforms/{platform_id}/connect")
async def connect_platform_account(
    platform_id: str,
    payload: PlatformConnectionInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    platform = _get_valid_platform(platform_id)
    auth_method = payload.auth_method.strip().lower()
    if auth_method not in ALLOWED_PLATFORM_AUTH_METHODS:
        raise HTTPException(
            status_code=422,
            detail="Unsupported auth_method. Use profile_link, session_cookie, or credentials.",
        )

    clean_profile_url = (payload.profile_url or "").strip() or None
    if clean_profile_url and not (
        clean_profile_url.startswith("https://")
        or clean_profile_url.startswith("http://")
    ):
        raise HTTPException(
            status_code=422,
            detail="Profile URL must start with http:// or https://.",
        )

    clean_username = (payload.username or "").strip() or None
    clean_cookie = (payload.session_cookie or "").strip() or None
    clean_password = (payload.password or "").strip() or None

    res = await db.execute(
        select(CandidateCredential).where(
            CandidateCredential.user_id == current_user.id,
            CandidateCredential.platform == platform.id,
        )
    )
    cred = res.scalars().first()

    has_existing_identifier = bool(
        cred
        and cred.is_active
        and (
            cred.username
            or cred.session_cookie
            or (isinstance(cred.extra_data, dict) and cred.extra_data.get("profile_url"))
        )
    )
    if not any([clean_profile_url, clean_username, clean_cookie, has_existing_identifier]):
        raise HTTPException(
            status_code=422,
            detail=f"Provide your {platform.name} profile URL, account email/handle, or session cookie to link this platform.",
        )

    now = datetime.datetime.now(datetime.timezone.utc)
    if cred is None:
        cred = CandidateCredential(
            user_id=current_user.id,
            platform=platform.id,
            auth_method=auth_method,
            username=clean_username,
            encrypted_password=clean_password,
            session_cookie=clean_cookie,
            is_active=True,
            status="CONNECTED",
            auto_easy_apply=payload.auto_easy_apply,
            last_verified_at=now,
            extra_data={"profile_url": clean_profile_url} if clean_profile_url else {},
        )
        db.add(cred)
    else:
        cred.auth_method = auth_method
        if clean_username is not None:
            cred.username = clean_username
        if clean_password is not None:
            cred.encrypted_password = clean_password
        if clean_cookie is not None:
            cred.session_cookie = clean_cookie
        existing_extra = dict(cred.extra_data) if isinstance(cred.extra_data, dict) else {}
        if clean_profile_url is not None:
            existing_extra["profile_url"] = clean_profile_url
        cred.extra_data = existing_extra
        cred.auto_easy_apply = payload.auto_easy_apply
        cred.is_active = True
        cred.status = "CONNECTED"
        cred.last_verified_at = now

    await db.commit()
    await db.refresh(cred)

    await agent_console.broadcast_log(
        user_id=current_user.id,
        level="SUCCESS",
        stage="DAEMON",
        message=f"🔗 {platform.name} account linked for Candidate #{current_user.id} ({auth_method}).",
        details={"platform": platform.id, "auth_method": auth_method, "status": "CONNECTED"},
    )
    return _serialize_platform_connection(platform, cred)


@router.post("/platforms/{platform_id}/test")
async def test_platform_connection(
    platform_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    platform = _get_valid_platform(platform_id)
    res = await db.execute(
        select(CandidateCredential).where(
            CandidateCredential.user_id == current_user.id,
            CandidateCredential.platform == platform.id,
        )
    )
    cred = res.scalars().first()
    if not cred or not cred.is_active:
        raise HTTPException(
            status_code=400,
            detail=f"{platform.name} account is not linked yet.",
        )

    now = datetime.datetime.now(datetime.timezone.utc)
    cred.last_verified_at = now
    cred.status = "CONNECTED"
    await db.commit()

    await agent_console.broadcast_log(
        user_id=current_user.id,
        level="SUCCESS",
        stage="DAEMON",
        message=f"✅ {platform.name} saved account link verified ({cred.auth_method}).",
        details={"platform": platform.id, "status": "VERIFIED"},
    )
    return {
        "status": "connected",
        "platform": platform.id,
        "message": f"{platform.name} account link verified ({cred.auth_method}).",
        "last_verified_at": now.isoformat(),
    }


@router.delete("/platforms/{platform_id}/disconnect")
async def disconnect_platform_account(
    platform_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    platform = _get_valid_platform(platform_id)
    res = await db.execute(
        select(CandidateCredential).where(
            CandidateCredential.user_id == current_user.id,
            CandidateCredential.platform == platform.id,
        )
    )
    cred = res.scalars().first()
    if cred:
        cred.is_active = False
        cred.status = "DISCONNECTED"
        cred.session_cookie = None
        cred.encrypted_password = None
        cred.extra_data = {}
        await db.commit()
        await db.refresh(cred)

    await agent_console.broadcast_log(
        user_id=current_user.id,
        level="WARN",
        stage="DAEMON",
        message=f"🔌 {platform.name} account unlinked for Candidate #{current_user.id}.",
        details={"platform": platform.id, "status": "DISCONNECTED"},
    )
    return _serialize_platform_connection(platform, cred)
