import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base

class CandidateCredential(Base):
    __tablename__ = "candidate_credentials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    platform = Column(String, default="linkedin", index=True) # linkedin, indeed, etc.
    auth_method = Column(String, default="session_cookie")     # session_cookie, credentials
    username = Column(String, nullable=True)                  # LinkedIn login email or phone
    encrypted_password = Column(String, nullable=True)        # Masked/encrypted credentials
    session_cookie = Column(String, nullable=True)            # li_at cookie
    is_active = Column(Boolean, default=True)
    status = Column(String, default="CONNECTED")              # CONNECTED, DISCONNECTED, CHALLENGE_REQUIRED, EXPIRED
    auto_easy_apply = Column(Boolean, default=True)
    last_verified_at = Column(DateTime(timezone=True), nullable=True)
    extra_data = Column(JSON, nullable=True)

    user = relationship("User")
