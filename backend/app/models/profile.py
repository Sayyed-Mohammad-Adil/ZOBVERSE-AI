from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import Base

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    
    current_role = Column(String, nullable=True)
    total_experience_years = Column(Integer, nullable=True)
    
    summary = Column(Text, nullable=True)
    
    # Simple JSON strings for arrays, or could use separate tables for 1-to-many
    skills = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="profile")
