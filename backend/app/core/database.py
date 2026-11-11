import os
import socket
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

def get_engine_url() -> str:
    url = settings.DATABASE_URL
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # If host is 'postgres' but not resolvable in current environment (e.g. running outside docker)
    if "@postgres:" in url:
        try:
            socket.gethostbyname("postgres")
        except socket.gaierror:
            url = url.replace("@postgres:", "@localhost:", 1)
    return url

from sqlalchemy.pool import NullPool

engine = create_async_engine(get_engine_url(), echo=False, poolclass=NullPool)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

