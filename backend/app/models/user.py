from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    questions = relationship("Question", back_populates="user")
    resumes = relationship("Resume", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
    applications = relationship("Application", back_populates="user")
    interviews = relationship("Interview", back_populates="user")
    offers = relationship("Offer", back_populates="user")
    profile = relationship("CandidateProfile", back_populates="user", uselist=False)
    preferences = relationship("CandidatePreferences", back_populates="user", uselist=False)

