from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    base_salary = Column(Float, nullable=False)
    bonus = Column(Float, nullable=True)
    equity = Column(String, nullable=True)
    currency = Column(String, default="USD")
    location = Column(String, nullable=True)
    work_mode = Column(String, nullable=True)
    joining_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="PENDING")  # PENDING, ACCEPTED, DECLINED, NEGOTIATING
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="offers")
    application = relationship("Application", back_populates="offers")
