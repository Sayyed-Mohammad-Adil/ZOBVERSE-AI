from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Float
from sqlalchemy.orm import relationship
import datetime
from app.models.base import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question_text = Column(String, index=True)
    answer_text = Column(Text)
    category = Column(String) # e.g. "TECHNICAL", "BEHAVIORAL", "LOGISTICS"
    confidence_score = Column(Float, default=1.0)
    source = Column(String, default="User confirmed") # e.g. "Candidate profile -> CV", "User confirmed"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="questions")
