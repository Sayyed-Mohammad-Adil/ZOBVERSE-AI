from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    interview_date = Column(DateTime(timezone=True), nullable=False)
    round = Column(String, nullable=False, default="Technical")
    interviewer = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    next_step = Column(String, nullable=True)
    reminder_set = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="interviews")
    application = relationship("Application", back_populates="interviews")
