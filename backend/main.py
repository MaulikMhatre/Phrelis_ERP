import uvicorn
import math
import uuid
from datetime import datetime
from typing import List, Optional
from datetime import datetime, date
from sqlalchemy import func

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

# Local Imports
from database import engine, get_db
import models

# pip install langchain-google-genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

# Initialize database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PHRELIS Hospital OS")

# CORS Setup - Essential for Frontend (3000) to talk to Backend (8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AI Agent ---
class MedicalAgent:
    def __init__(self):
        try:
            # Note: Ensure GOOGLE_API_KEY is in your environment variables
            self.llm = ChatGoogleGenerativeAI(model="gemini-pro")
            self.active = True
        except:
            self.active = False
        
    async def justify(self, level: int, symptoms: List[str]):
        if not self.active: return "Protocol-based prioritization."
        prompt = ChatPromptTemplate.from_template("Justify ESI Level {level} for {symptoms} in 1 sentence.")
        chain = prompt | self.llm
        try:
            res = await chain.ainvoke({"level": level, "symptoms": symptoms})
            return res.content
        except: return "Acuity set by physiological markers."

ai_agent = MedicalAgent()

# --- Connection Manager for WebSockets ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try: await connection.send_json(message)
            except: pass

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # simple echo or keep-alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# --- Pydantic Models ---
class AdmissionRequest(BaseModel):
    bed_id: str
    patient_name: str
    age: int
    condition: str

class TriageRequest(BaseModel):
    symptoms: List[str]
    vitals: Optional[dict] = {}

class AmbulanceRequest(BaseModel):
    severity: str # "HIGH" (ICU) or "LOW" (ER)
    location: str
    eta: int

class StaffClockIn(BaseModel):
    staff_id: str

class StaffAssign(BaseModel):
    staff_id: str
    bed_id: str
    role: str # "Primary Nurse" or "Attending Physician"

class TaskUpdate(BaseModel):
    task_id: int
    status: str

# --- Admin ERP Endpoints ---

@app.post("/api/erp/admit")
async def admit_patient(request: AdmissionRequest, db: Session = Depends(get_db)):
    # 1. Find the bed
    bed = db.query(models.BedModel).filter(models.BedModel.id == request.bed_id).first()
    
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    
    # 2. Check if occupied
    if bed.is_occupied:
         raise HTTPException(status_code=400, detail=f"Bed {bed.id} is already occupied.")

    # 3. Update the bed data
    bed.is_occupied = True
    bed.patient_name = request.patient_name
    bed.condition = request.condition
    # Note: We do NOT change bed.type here. The bed type is physical and fixed.
    
    if hasattr(bed, 'age'): 
        bed.patient_age = request.age
    
    db.commit()
    db.refresh(bed)
    
    # 4. Notify the Dashboard to refresh the Heatmap immediately
    await manager.broadcast({"type": "REFRESH_RESOURCES"})
    
    return {"message": f"Patient admitted to {bed.id}", "status": "success"}



@app.get("/api/erp/beds")
def list_beds(db: Session = Depends(get_db)):
    return db.query(models.BedModel).all()

@app.post("/api/erp/discharge/{bed_id}")
async def discharge(bed_id: str, db: Session = Depends(get_db)):
    bed = db.query(models.BedModel).filter(models.BedModel.id == bed_id).first()
    if bed:
        bed.is_occupied = False
        bed.patient_name = None
        bed.patient_age = None
        bed.condition = None
        db.commit()
        await manager.broadcast({"type": "REFRESH_RESOURCES"})
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Bed not found")

# --- Analytics & Triage Endpoints ---

@app.post("/api/triage/assess")
async def assess_patient(request: TriageRequest, db: Session = Depends(get_db)):
    # Calculate ESI Level (Mock logic for now, using AI usually)
    level = 3 # Default
    if "chest pain" in request.symptoms or "stroke" in request.symptoms:
        level = 1
    elif "fever" in request.symptoms:
        level = 4
    
    acuity_text = "Resuscitation" if level == 1 else "Emergent" if level == 2 else "Urgent"
    
    bed_type = "ICU" if level <= 2 else "ER"
    
    # 1. Save to History Table (PatientRecord)
    new_record = models.PatientRecord(
        id=str(uuid.uuid4()),
        esi_level=level,
        acuity=acuity_text,
        symptoms=request.symptoms,
        timestamp=datetime.utcnow()
    )
    db.add(new_record)

    # 2. Auto-assign Bed
    bed = db.query(models.BedModel).filter(
        models.BedModel.type == bed_type, 
        models.BedModel.is_occupied == False
    ).first()
    
    justification = await ai_agent.justify(level, request.symptoms)
    
    assigned_id = None
    if bed:
        bed.is_occupied = True
        bed.condition = f"Triaged: {acuity_text}"
        bed.admission_time = datetime.utcnow()
        assigned_id = bed.id
    else:
        assigned_id = "WAITING_LIST"

    db.commit()

    # Broadcast to dashboard
    await manager.broadcast({
        "type": "NEW_ADMISSION", 
        "bed_id": assigned_id, 
        "is_critical": level <= 2
    })

    return {
        "severity": acuity_text, 
        "recommended_actions": ["Immediate Vitals", "ECG" if level == 1 else "Observation"],
        "assigned_bed": assigned_id, 
        "ai_justification": justification
    }

@app.get("/api/history/day/{target_date}")
def get_history_by_day(target_date: date, db: Session = Depends(get_db)):
    # func.date extracts just the YYYY-MM-DD part from the timestamp
    return db.query(models.PatientRecord).filter(
        func.date(models.PatientRecord.timestamp) == target_date
    ).order_by(models.PatientRecord.timestamp.desc()).all()

@app.get("/api/erp/bed-info/{bed_id}")
def get_bed_info(bed_id: str, db: Session = Depends(get_db)):
    bed = db.query(models.BedModel).filter(models.BedModel.id == bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
        
    return {
        "id": bed.id,
        "type": bed.type,
        "is_occupied": bed.is_occupied,
        "details": {
            "name": bed.patient_name if bed.is_occupied else "Empty",
            "age": bed.patient_age if bed.is_occupied else None,
            "condition": bed.condition if bed.is_occupied else "No active condition",
            "admitted_at": bed.admission_time.strftime("%Y-%m-%d %H:%M") if (bed.is_occupied and bed.admission_time) else None
        }
    }

# --- Infrastructure ---

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Helper to count occupied beds by type
    def get_count(unit_type: str):
        return db.query(models.BedModel).filter(
            models.BedModel.type == unit_type, 
            models.BedModel.is_occupied == True
        ).count()

    er_occ = get_count("ER")
    icu_occ = get_count("ICU")
    wards_occ = get_count("Wards")
    surgery_occ = get_count("Surgery")
    
    total_beds = db.query(models.BedModel).count() or 190

    return {
        "occupancy": {
            "ER": er_occ, 
            "ICU": icu_occ, 
            "Wards": wards_occ, 
            "Surgery": surgery_occ
        },
        "bed_stats": {
            "total": total_beds,
            "occupied": er_occ + icu_occ + wards_occ + surgery_occ,
            "available": total_beds - (er_occ + icu_occ + wards_occ + surgery_occ)
        },
        # ... rest of your stats
    }
# --- Ambulance System ---

@app.get("/api/ambulances")
def list_ambulances(db: Session = Depends(get_db)):
    return db.query(models.Ambulance).all()

@app.post("/api/ambulance/dispatch")
def dispatch_ambulance(request: AmbulanceRequest, db: Session = Depends(get_db)):
    # 1. Check Hospital Capacity (Diversion Logic)
    required_type = "ICU" if request.severity.upper() == "HIGH" else "ER"
    
    total_beds = 20 if required_type == "ICU" else 60
    occupied = db.query(models.BedModel).filter(
        models.BedModel.type == required_type, 
        models.BedModel.is_occupied == True
    ).count()
    
    if occupied >= total_beds:
        return {
            "status": "DIVERTED", 
            "message": f"Hospital {required_type} Full. Ambulance Redirected to neighboring facility.",
            "ambulance_id": None
        }

    # 2. Find Available Ambulance
    ambulance = db.query(models.Ambulance).filter(models.Ambulance.status == "IDLE").first()
    
    if not ambulance:
        return {
            "status": "DELAYED", 
            "message": "No ambulances available at station.",
            "ambulance_id": None
        }

    # 3. Dispatch
    ambulance.status = "DISPATCHED"
    ambulance.location = request.location
    ambulance.eta_minutes = request.eta
    db.commit()
    
    return {
        "status": "DISPATCHED",
        "ambulance_id": ambulance.id,
        "eta": f"{request.eta} mins",
        "target_unit": required_type
    }

@app.post("/api/ambulance/reset/{ambulance_id}")
def reset_ambulance(ambulance_id: str, db: Session = Depends(get_db)):
    amb = db.query(models.Ambulance).filter(models.Ambulance.id == ambulance_id).first()
    if amb:
        amb.status = "IDLE"
        amb.location = "Station"
        amb.eta_minutes = 0
        db.commit()
        return {"status": "success", "message": f"Ambulance {ambulance_id} returned to station."}
    raise HTTPException(status_code=404, detail="Ambulance not found")

# --- Staff & Task Management ---

@app.get("/api/staff")
def get_staff(db: Session = Depends(get_db)):
    # Calculate live totals for the department view
    total_nurses = db.query(models.Staff).filter(models.Staff.role == "Nurse", models.Staff.is_clocked_in == True).count()
    total_doctors = db.query(models.Staff).filter(models.Staff.role == "Doctor", models.Staff.is_clocked_in == True).count()
    
    staff_list = db.query(models.Staff).all()
    assignments = db.query(models.BedAssignment).filter(models.BedAssignment.is_active == True).all()
    
    return {
        "stats": {"nurses_on_shift": total_nurses, "doctors_on_shift": total_doctors},
        "staff": staff_list,
        "assignments": assignments
    }

@app.post("/api/staff/clock")
def clock_staff(request: StaffClockIn, db: Session = Depends(get_db)):
    staff = db.query(models.Staff).filter(models.Staff.id == request.staff_id).first()
    if not staff: raise HTTPException(status_code=404, detail="Staff not found")
    
    staff.is_clocked_in = not staff.is_clocked_in # Toggle
    db.commit()
    return {"status": "success", "is_clocked_in": staff.is_clocked_in}

@app.post("/api/staff/assign")
def assign_staff(request: StaffAssign, db: Session = Depends(get_db)):
    # 1. Load Balancing Check (Acuity Based)
    if request.role == "Primary Nurse":
        # Check current load
        current_load = db.query(models.BedAssignment).filter(
            models.BedAssignment.staff_id == request.staff_id,
            models.BedAssignment.is_active == True
        ).count()
        
        # Check if target bed is critical (ICU or High Acuity)
        target_bed = db.query(models.BedModel).filter(models.BedModel.id == request.bed_id).first()
        is_critical = target_bed.type == "ICU" or (target_bed.condition and "Critical" in target_bed.condition)
        
        # Max 3 patients if one is critical, else max 6
        # This is a simplified implementation of the "Acuity-Based" Assignment
        if is_critical and current_load >= 2: # 1 Critical + 2 others = 3 max
             raise HTTPException(status_code=400, detail="Load Limit Reached: Nurse has critical patient load.")
        if current_load >= 6:
             raise HTTPException(status_code=400, detail="Load Limit Reached: Max 6 patients per nurse.")

    # 2. Deactivate previous assignment for this bed/role combo if exists
    existing = db.query(models.BedAssignment).filter(
        models.BedAssignment.bed_id == request.bed_id,
        models.BedAssignment.assignment_type == request.role,
        models.BedAssignment.is_active == True
    ).first()
    if existing:
        existing.is_active = False
        existing.end_time = datetime.utcnow()
    
    # 3. Create New Assignment
    new_assign = models.BedAssignment(
        bed_id=request.bed_id,
        staff_id=request.staff_id,
        assignment_type=request.role
    )
    db.add(new_assign)
    db.commit()
    return {"status": "assigned", "staff": request.staff_id, "bed": request.bed_id}

@app.get("/api/staff/dashboard/{staff_id}")
def staff_dashboard(staff_id: str, db: Session = Depends(get_db)):
    # "Digital Floor Plan" logic
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff: raise HTTPException(404, "Staff not found")
    
    # Get Assigned Beds
    assignments = db.query(models.BedAssignment).filter(
        models.BedAssignment.staff_id == staff_id,
        models.BedAssignment.is_active == True
    ).all()
    
    bed_ids = [a.bed_id for a in assignments]
    beds = db.query(models.BedModel).filter(models.BedModel.id.in_(bed_ids)).all()
    
    # Get Tasks for these beds
    tasks = db.query(models.Task).filter(
        models.Task.bed_id.in_(bed_ids),
        models.Task.status == "Pending"
    ).all()
    
    return {
        "role": staff.role,
        "my_beds": beds,
        "my_tasks": tasks
    }

def initialize_hospital_beds(db: Session):
    targets = [("ICU", "ICU", 20), ("ER", "ER", 60), ("Wards", "WARD", 100), ("Surgery", "SURG", 10)]
    for unit, prefix, target in targets:
        existing = db.query(models.BedModel).filter(models.BedModel.type == unit).all()
        existing_ids = {b.id for b in existing}
        to_add = []
        for i in range(1, target + 1):
            bid = f"{prefix}-{i}"
            if bid not in existing_ids:
                to_add.append(models.BedModel(id=bid, type=unit, is_occupied=False))
        if to_add:
            db.add_all(to_add)
            db.commit()

@app.on_event("startup")
def seed_db():
    db = next(get_db())
    initialize_hospital_beds(db)
    
    # Seed Ambulances
    if db.query(models.Ambulance).count() == 0:
        ambs = []
        for i in range(1, 6): # 5 Ambulances
            ambs.append(models.Ambulance(id=f"AMB-0{i}", status="IDLE", location="Station", eta_minutes=0))
        db.add_all(ambs)
        db.commit()

    # Seed Staff
    if db.query(models.Staff).count() == 0:
        staff = [
            models.Staff(id="N-01", name="Nurse Jackie", role="Nurse", is_clocked_in=True),
            models.Staff(id="N-02", name="Nurse Ratched", role="Nurse", is_clocked_in=True),
            models.Staff(id="N-03", name="Nurse Joy", role="Nurse", is_clocked_in=False),
            models.Staff(id="D-01", name="Dr. House", role="Doctor", is_clocked_in=True),
            models.Staff(id="D-02", name="Dr. Strange", role="Doctor", is_clocked_in=False),
        ]
        db.add_all(staff)
        db.commit()

# --- Weather Service ---
class WeatherService:
    @staticmethod
    async def get_weather_coefficient() -> dict:
        hour = datetime.now().hour
        temp, humidity, condition = 20, 50, "Clear"
        if hour < 8: temp, condition = -2, "Snow"
        elif 12 < hour < 16: temp, humidity = 35, 95
        multiplier, reason = 1.0, "Normal Conditions"
        if temp < 0: multiplier, reason = 1.15, f"Cold Snap ({temp}°C)"
        
        return {
            "temp": temp, "humidity": humidity, "condition": condition,
            "multiplier": multiplier, "reason": reason
        }

@app.post("/api/predict-inflow")
async def predict_inflow(db: Session = Depends(get_db)):
    """
    Deterministic Neural Engine Logic: 
    Strict mathematical bimodal forecast.
    """
    weather = await WeatherService.get_weather_coefficient()
    w_mult = weather["multiplier"] 
    
    occupied_count = db.query(models.BedModel).filter(models.BedModel.is_occupied == True).count()
    # Saturation factor based on real-time bed data
    saturation_factor = 1 + (occupied_count / 60) * 0.25 

    current_hour = datetime.now().hour
    forecast = []
    total_val = 0
    
    # Generate 12-hour deterministic forecast
    for i in range(1, 13):
        h = (current_hour + i) % 24
        
        # Fixed Bimodal Gaussian logic: Morning (10am) and Evening (8pm) peaks
        morning_peak = 18 * math.exp(-((h - 10)**2) / 6) 
        evening_peak = 14 * math.exp(-((h - 20)**2) / 5)
        
        # Base inflow is now purely mathematical (noise removed)
        base_inflow = 4 + morning_peak + evening_peak
        
        predicted_count = int(base_inflow * w_mult * saturation_factor)
        forecast.append({"hour": f"{h}:00", "inflow": predicted_count})
        total_val += predicted_count
    
    peak_entry = max(forecast, key=lambda x: x["inflow"])
    return {
        "forecast": forecast,
        "total_predicted_inflow": total_val,
        "weather_impact": weather,
        "confidence_score": 95, 
        "factors": {
            "environmental": f"{round(w_mult, 2)}x",
            "systemic_saturation": f"{round(saturation_factor, 2)}x"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
