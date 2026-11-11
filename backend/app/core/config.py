import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "AI Job Agent API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/job_agent")
    OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://localhost:11434")
    DEFAULT_LLM_MODEL: str = os.getenv("DEFAULT_LLM_MODEL", "llama3")
    DEFAULT_EMBEDDING_MODEL: str = os.getenv("DEFAULT_EMBEDDING_MODEL", "nomic-embed-text")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev_secret")
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "super_secret_encryption_key_please_change")
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str | None = None
    SMTP_STARTTLS: bool = True
    FRONTEND_URL: str = "http://localhost:3000"
    STORAGE_PATH: str = os.getenv("STORAGE_PATH", "./storage/resumes")
    LAYA_ENABLED: bool = True
    LAYA_MODEL: str = os.getenv("LAYA_MODEL", "default")
    PLAYWRIGHT_HEADLESS: bool = os.getenv("PLAYWRIGHT_HEADLESS", "false").lower() in ("true", "1", "t", "yes")
    PLAYWRIGHT_SLOW_MO_MS: int = int(os.getenv("PLAYWRIGHT_SLOW_MO_MS", "100") or 0)

settings = Settings()
