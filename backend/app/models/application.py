from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)
    status = Column(String, index=True, default="READY") # READY, REVIEW, APPLIED, INTERVIEW, OFFER, REJECTED
    applied_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(String, nullable=True)
    history = Column(JSON, nullable=True) # To track status changes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="applications")
    job = relationship("Job")
    resume = relationship("Resume")
    interviews = relationship("Interview", back_populates="application")
    offers = relationship("Offer", back_populates="application")

