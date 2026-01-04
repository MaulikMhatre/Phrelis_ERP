from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, Float
from datetime import datetime
from database import Base

class BedModel(Base):
    __tablename__ = "beds"
    
    id = Column(String, primary_key=True, index=True) #  ICU-1
    type = Column(String)                             # ICU or ER
    is_occupied = Column(Boolean, default=False)
    
    # Patient details for your new ERP page
    patient_name = Column(String, nullable=True)
    patient_age = Column(Integer, nullable=True)
    condition = Column(String, nullable=True)
    
    # Snapshot of vitals at time of admission
    vitals_snapshot = Column(String, nullable=True) 
    admission_time = Column(DateTime, default=datetime.utcnow)
    ventilator_in_use = Column(Boolean, default=False)
    


class PredictionHistory(Base):
    __tablename__ = "prediction_history"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    total_predicted = Column(Integer)
    peak_value = Column(Integer)
    peak_time = Column(String)
    actual_weather_multiplier = Column(Float) 


class Ambulance(Base):
    __tablename__ = "ambulances"
    
    id = Column(String, primary_key=True, index=True) #  AMB-01
    status = Column(String, default="IDLE")           # IDLE, DISPATCHED, RETURNING, MAINTENANCE
    location = Column(String, default="Station")      # Current location description
    assigned_patient_id = Column(String, nullable=True)
    eta_minutes = Column(Integer, nullable=True)

class PatientRecord(Base):
    __tablename__ = "patients"
    
    id = Column(String, primary_key=True, index=True)
    esi_level = Column(Integer)
    acuity = Column(String)
    symptoms = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # New fields for history integration
    patient_name = Column(String, nullable=True)
    patient_age = Column(Integer, nullable=True)
    condition = Column(String, nullable=True)
    discharge_time = Column(DateTime, nullable=True)

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(String, primary_key=True) # "General", "ICU", "ER"
    total_nurses_on_shift = Column(Integer, default=0)
    total_doctors_on_shift = Column(Integer, default=0)

class Staff(Base):
    __tablename__ = "staff"
    
    id = Column(String, primary_key=True) # S-101
    name = Column(String)
    role = Column(String) # "Nurse", "Doctor"
    is_clocked_in = Column(Boolean, default=False)
    department_id = Column(String, nullable=True) 

class BedAssignment(Base):
    __tablename__ = "bed_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    bed_id = Column(String) # ForeignKey to beds.id
    staff_id = Column(String) # ForeignKey to staff.id
    assignment_type = Column(String) # "Primary Nurse", "Attending Physician"
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    bed_id = Column(String)
    assigned_to_staff_id = Column(String, nullable=True)
    description = Column(String)
    due_time = Column(DateTime)
    priority = Column(String) # "Low", "Medium", "High", "Critical"
    status = Column(String, default="Pending") # "Pending", "Completed"
    completed_at = Column(DateTime, nullable=True)

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True)
    event_type = Column(String) 
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(String, nullable=True)

class PredictionLog(Base):
    __tablename__ = "prediction_log"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    prediction_text = Column(String) 
    target_department = Column(String) # ICU, ER
    predicted_delay_minutes = Column(Integer)
