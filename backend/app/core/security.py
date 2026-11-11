import bcrypt
import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Any, Union
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import settings
from app.models.user import User
from app.core.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def _password_reset_secret() -> bytes:
    return hmac.new(
        settings.JWT_SECRET.encode("utf-8"),
        b"password-reset",
        hashlib.sha256,
    ).digest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8")[:72], hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8")[:72], salt).decode("utf-8")


def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=60 * 24 * 8)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")
    return encoded_jwt


def create_password_reset_token(subject: Union[str, Any], hashed_password: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
    password_fingerprint = hmac.new(
        _password_reset_secret(),
        hashed_password.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return jwt.encode(
        {
            "exp": expires_at,
            "sub": str(subject),
            "purpose": "password_reset",
            "password_fingerprint": password_fingerprint,
        },
        _password_reset_secret(),
        algorithm="HS256",
    )


def _decode_password_reset_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, _password_reset_secret(), algorithms=["HS256"])
    except JWTError:
        return None

    subject = payload.get("sub")
    if payload.get("purpose") != "password_reset" or not isinstance(subject, str):
        return None
    return payload


def get_password_reset_subject(token: str) -> str | None:
    payload = _decode_password_reset_token(token)
    return payload["sub"] if payload else None


def verify_password_reset_token(token: str, hashed_password: str) -> str | None:
    payload = _decode_password_reset_token(token)
    if payload is None:
        return None
    password_fingerprint = hmac.new(
        _password_reset_secret(),
        hashed_password.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    token_fingerprint = payload.get("password_fingerprint")
    if not isinstance(token_fingerprint, str) or not hmac.compare_digest(
        token_fingerprint,
        password_fingerprint,
    ):
        return None
    return payload["sub"]


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user
