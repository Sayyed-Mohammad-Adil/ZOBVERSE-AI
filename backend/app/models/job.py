from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.sql import func
from app.models.base import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, index=True, nullable=False)
    external_job_id = Column(String, unique=True, index=True, nullable=False)
    canonical_url = Column(String, nullable=True)
    company = Column(String, index=True, nullable=False)
    title = Column(String, index=True, nullable=False)
    location = Column(String, nullable=True)
    country = Column(String, nullable=True)
    work_mode = Column(String, nullable=True)  # Remote, Hybrid, Onsite
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    salary_currency = Column(String, nullable=True)
    salary_period = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    responsibilities = Column(Text, nullable=True)
    skills = Column(String, nullable=True) # Could be JSON or comma-separated
    posted_at = Column(DateTime(timezone=True), nullable=True)
    discovered_at = Column(DateTime(timezone=True), server_default=func.now())
    application_url = Column(String, nullable=True)
    description_hash = Column(String, index=True, nullable=True)
    
    # Needs pgvector integration later:
    # embedding = Column(Vector(1536))
    
    status = Column(String, default="DISCOVERED") # DISCOVERED, APPLIED, REJECTED, etc.
