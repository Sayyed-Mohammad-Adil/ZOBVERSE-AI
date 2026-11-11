# Import all models here so Alembic can discover them
from app.models.base import Base
from app.models.user import User
from app.models.job import Job
from app.models.background_job import BackgroundJob
from app.models.profile import CandidateProfile
from app.models.preferences import CandidatePreferences
from app.models.resume import Resume
from app.models.application import Application
from app.models.question import Question
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.models.interview import Interview
from app.models.offer import Offer
from app.models.credential import CandidateCredential
from app.models.user_job import UserJob
