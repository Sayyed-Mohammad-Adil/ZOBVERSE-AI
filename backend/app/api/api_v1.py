import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter

api_router = APIRouter()

from app.api.endpoints import (
    auth, profile, preferences, resume, jobs, applications,
    matching, duplicate_detection, worker_triggers, questions,
    notifications, analytics, settings as settings_endpoint,
    interviews, offers, review
)
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(preferences.router, prefix="/preferences", tags=["preferences"])
api_router.include_router(resume.router, prefix="/resumes", tags=["resumes"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(matching.router, prefix="/matching", tags=["matching"])
api_router.include_router(duplicate_detection.router, prefix="/duplicates", tags=["duplicates"])
api_router.include_router(worker_triggers.router, prefix="/workers", tags=["workers"])
api_router.include_router(questions.router, prefix="/questions", tags=["questions"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(settings_endpoint.router, prefix="/settings", tags=["settings"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(offers.router, prefix="/offers", tags=["offers"])
api_router.include_router(review.router, prefix="/review", tags=["review"])

