from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base

class CandidatePreferences(Base):
    __tablename__ = "candidate_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Salary
    target_salary = Column(Float, nullable=True)
    minimum_salary = Column(Float, nullable=True)
    currency = Column(String, default="USD")
    salary_period = Column(String, default="Annual")
    
    # Work settings
    preferred_roles = Column(JSON, nullable=True)
    excluded_roles = Column(JSON, nullable=True)
    
    preferred_locations = Column(JSON, nullable=True)
    remote_only = Column(Boolean, default=False)
    willing_to_relocate = Column(Boolean, default=False)
    
    # Automation rules
    daily_application_limit = Column(Integer, default=10)
    automation_mode = Column(String, default="Assisted") # Manual, Assisted, Automated

    user = relationship("User", back_populates="preferences")

