import uvicorn
import math
import uuid
from datetime import datetime
from typing import List

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

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
    allow_origins=["*"],
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


# --- Pydantic Models ---
class AdmissionRequest(BaseModel):
    bed_id: str
    patient_name: str
    age: int
    condition: str

class TriageRequest(BaseModel):
    spo2: int
    heart_rate: int
    symptoms: List[str]

# --- Admin ERP Endpoints ---

@app.post("/api/erp/admit")
async def admit_patient(request: AdmissionRequest, db: Session = Depends(get_db)):
    # 1. Find the bed in your database using the BedModel
    bed = db.query(models.BedModel).filter(models.BedModel.id == request.bed_id).first()
    
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    
    if bed.is_occupied:
        raise HTTPException(status_code=400, detail="Bed already occupied")

    # 2. Update bed status and patient details
    bed.is_occupied = True
    bed.patient_id = request.patient_name  # Storing name in patient_id for simplicity, or add patient_name to your Model
    # Note: If your BedModel doesn't have 'age' or 'condition' fields, 
    # you'll need to add them to models.py first.
    if hasattr(bed, 'age'): bed.age = request.age
    if hasattr(bed, 'condition'): bed.condition = request.condition
    
    db.commit()
    db.refresh(bed)
    
    return {"message": f"Patient {request.patient_name} admitted to {request.bed_id}", "status": "success"}

@app.get("/api/erp/beds")
def list_beds(db: Session = Depends(get_db)):
    return db.query(models.BedModel).all()

@app.post("/api/erp/discharge/{bed_id}")
def discharge(bed_id: str, db: Session = Depends(get_db)):
    bed = db.query(models.BedModel).filter(models.BedModel.id == bed_id).first()
    if bed:
        bed.is_occupied = False
        bed.patient_id = None
        db.commit()
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Bed not found")

# --- Analytics & Triage Endpoints ---

@app.post("/api/predict-inflow")
async def predict_inflow(db: Session = Depends(get_db)):
    h = datetime.now().hour
    morning = 18 * math.exp(-((h - 10)**2) / 6) 
    evening = 14 * math.exp(-((h - 20)**2) / 5)
    predicted_count = int(max(5, 10 + morning + evening))
    
    return {
        "total_predicted_inflow": predicted_count,
        "weather_impact": {
            "multiplier": 1.15,
            "reason": "Cold Snap - Resp. Risk",
            "temp": 2
        },
        "forecast": [
            {"hour": f"{(h+1)%24}:00", "inflow": predicted_count},
            {"hour": f"{(h+2)%24}:00", "inflow": int(predicted_count * 1.1)}
        ]
    }

@app.post("/api/triage/assess")
async def assess_patient(request: TriageRequest, db: Session = Depends(get_db)):
    level = 1 if request.spo2 < 85 else 2 if request.spo2 < 90 else 3
    bed_type = "ICU" if level <= 2 else "ER"
    
    bed = db.query(models.BedModel).filter(
        models.BedModel.type == bed_type, 
        models.BedModel.is_occupied == False
    ).first()
    
    justification = await ai_agent.justify(level, request.symptoms)
    
    if bed:
        # Mark as occupied but with "PENDING" status in the name
        bed.is_occupied = True
        bed.patient_name = "PENDING ADMISSION" 
        bed.condition = f"Level {level}: {justification[:30]}..."
        bed.vitals_snapshot = f"SPO2: {request.spo2}, HR: {request.heart_rate}"
        db.commit()
        assigned_id = bed.id
    else:
        assigned_id = "WAITING_LIST"

    # Broadcast to dashboard so the UI updates in real-time
    await manager.broadcast({"type": "NEW_ADMISSION", "bed_id": assigned_id})

    return {"esi_level": level, "assigned_bed": assigned_id, "ai_justification": justification}

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    icu_occ = db.query(models.BedModel).filter(models.BedModel.type == "ICU", models.BedModel.is_occupied == True).count()
    er_occ = db.query(models.BedModel).filter(models.BedModel.type == "ER", models.BedModel.is_occupied == True).count()
    return {
        "occupancy": {"ICU": int((icu_occ/20)*100), "ER": int((er_occ/40)*100), "Wards": 80, "Surgery": 10},
        "bed_stats": {"total": 60, "occupied": icu_occ + er_occ, "available": 60 - (icu_occ + er_occ)},
        "staff_ratio": "1:4",
        "resources": {"Ventilators": {"total": 20, "in_use": icu_occ}, "Ambulances": {"total": 10, "available": 6}}
    }

# --- Infrastructure ---

@app.on_event("startup")
def seed_db():
    db = next(get_db())
    if db.query(models.BedModel).count() == 0:
        beds = []
        for i in range(1, 21): beds.append(models.BedModel(id=f"ICU-{i}", type="ICU"))
        for i in range(1, 41): beds.append(models.BedModel(id=f"ER-{i}", type="ER"))
        db.add_all(beds)
        db.commit()

@app.websocket("/ws/vitals")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
# --- CSI ---
class ESIEngine:
    @staticmethod
    def calculate_acuity(spo2: int, heart_rate: int, symptoms: List[str]) -> dict:
        symptoms_lower = [s.lower() for s in symptoms]
        if spo2 < 85 or heart_rate > 140 or heart_rate < 30:
            return {"level": 1, "acuity": "Resuscitation", "color": "#ef4444"}
        if spo2 < 90 or "chest pain" in symptoms_lower or "stroke" in symptoms_lower:
            return {"level": 2, "acuity": "Emergent", "color": "#f97316"}
        if len(symptoms) >= 2 or heart_rate > 110:
            return {"level": 3, "acuity": "Urgent", "color": "#eab308"}
        return {"level": 4, "acuity": "Less Urgent", "color": "#22c55e"}

# ---  Weather Service (Deterministic Logic) ---
class WeatherService:
    @staticmethod
    async def get_weather_coefficient() -> dict:
        hour = datetime.now().hour
        temp, humidity, condition = 20, 50, "Clear"
        
        # Deterministic shifts based solely on current hour
        if hour < 8: temp, condition = -2, "Snow"
        elif 12 < hour < 16: temp, humidity = 35, 95
            
        multiplier, reason = 1.0, "Normal Conditions"
        if temp < 0:
            multiplier, reason = 1.15, f"Cold Snap ({temp}°C) - Resp. Risk"
        elif temp > 30 and humidity > 90:
            multiplier, reason = 1.20, f"Heatwave ({temp}°C, {humidity}%) - Cardiac Risk"
            
        return {
            "temp": temp, "humidity": humidity, "condition": condition,
            "multiplier": multiplier, "reason": reason
        }
# --- API predict -Inflow ---

@app.post("/api/predict-inflow")
async def predict_inflow(db: Session = Depends(get_db)):
    """
    Deterministic Neural Engine Logic: 
    Strict mathematical bimodal forecast.
    """
    weather = await WeatherService.get_weather_coefficient()
    w_mult = weather["multiplier"] # Removed neural_variance
    
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
        "confidence_score": 95, # Fixed confidence score for deterministic engine
        "factors": {
            "environmental": f"{round(w_mult, 2)}x",
            "systemic_saturation": f"{round(saturation_factor, 2)}x"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)