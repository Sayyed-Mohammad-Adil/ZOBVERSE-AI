from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api_v1 import api_router
from app.core.banner import print_startup_banner

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Print Open Code logo ASCII banner on backend startup
    print_startup_banner()
    yield

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "AI Job Agent API v1"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
