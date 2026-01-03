# backend/models.py
from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, Float # Add Float here
from datetime import datetime
from database import Base

class BedModel(Base):
    __tablename__ = "beds"
    id = Column(String, primary_key=True, index=True)
    type = Column(String)
    is_occupied = Column(Boolean, default=False)
    patient_id = Column(String, nullable=True)
    version = Column(Integer, default=1)

class PredictionHistory(Base):
    __tablename__ = "prediction_history"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    total_predicted = Column(Integer)
    peak_value = Column(Integer)
    peak_time = Column(String)
    # CHANGE THIS LINE: Use Float (capital F) instead of float
    actual_weather_multiplier = Column(Float) 

class PatientRecord(Base):
    __tablename__ = "patients"
    id = Column(String, primary_key=True, index=True)
    esi_level = Column(Integer)
    acuity = Column(String)
    symptoms = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)