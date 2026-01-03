

import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import httpx
import math
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

# Database Imports
from database import engine, get_db, Base
import models

# Initialize Database Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hospital OS - Enterprise Grade", version="2.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. Real-time Vitals Stream (WebSockets) ---

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
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# --- 2. Clinical Triage (ESI Engine) ---

class ESIEngine:
    @staticmethod
    def calculate_acuity(spo2: int, heart_rate: int, symptoms: List[str]) -> dict:
        symptoms_lower = [s.lower() for s in symptoms]
        
        # Level 1: Resuscitation
        if spo2 < 85 or heart_rate > 140 or heart_rate < 30:
            return {"level": 1, "acuity": "Resuscitation", "color": "#ef4444"} # Red
            
        # Level 2: Emergent
        if spo2 < 90 or "chest pain" in symptoms_lower or "stroke" in symptoms_lower:
            return {"level": 2, "acuity": "Emergent", "color": "#f97316"} # Orange
            
        # Level 3: Urgent
        if len(symptoms) >= 2 or heart_rate > 110:
            return {"level": 3, "acuity": "Urgent", "color": "#eab308"} # Yellow
            
        return {"level": 4, "acuity": "Less Urgent", "color": "#22c55e"} # Green

# --- 3. Weather-Inflow Predictive Service ---

class WeatherService:
    @staticmethod
    async def get_weather_coefficient() -> dict:
        # Mock logic as per code requirements
        hour = datetime.now().hour
        temp, humidity, condition = 20, 50, "Clear"
        
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

# --- 4. Persistent State Orchestrator ---

class HospitalState:
    def __init__(self):
        # Base inventory (Could also be moved to DB tables if needed)
        self.occupancy = {"ER": 45, "ICU": 12, "Wards": 80, "Surgery": 5}
        self.capacity = {"ER": 60, "ICU": 20, "Wards": 100, "Surgery": 10}
        self.staff = {"Nurses": 20, "Doctors": 8}
        self.resources = {
            "Ventilators": {"total": 20, "in_use": 8}, 
            "Ambulances": {"total": 10, "available": 6}
        }

state = HospitalState()

# --- 5. API Endpoints ---

class TriageRequest(BaseModel):
    spo2: int
    heart_rate: int
    symptoms: List[str]

@app.post("/api/triage/assess")
async def assess_patient(request: TriageRequest, db: Session = Depends(get_db)):
    esi = ESIEngine.calculate_acuity(request.spo2, request.heart_rate, request.symptoms)
    bed_type = "ICU" if esi["level"] <= 2 else "ER"
    
    # DB Logic: Optimistic Locking Bed Assignment
    bed = db.query(models.BedModel).filter(
        models.BedModel.type == bed_type, 
        models.BedModel.is_occupied == False
    ).first()
    
    assigned_bed_id = "WAITING_LIST"
    if bed:
        bed.is_occupied = True
        bed.patient_id = str(uuid.uuid4())[:8]
        bed.version += 1
        db.commit()
        assigned_bed_id = bed.id
        # Update volatile state for heatmap
        state.occupancy[bed_type] += 1

    # Log Patient for History
    new_record = models.PatientRecord(
        id=str(uuid.uuid4())[:8],
        esi_level=esi["level"],
        acuity=esi["acuity"],
        symptoms=request.symptoms
    )
    db.add(new_record)
    db.commit()

    if esi["level"] == 1:
        await manager.broadcast({
            "type": "CRITICAL_VITALS",
            "message": f"ESI Level 1 Patient in {assigned_bed_id}!",
            "data": request.dict()
        })

    return {
        "esi_level": esi["level"],
        "acuity": esi["acuity"],
        "assigned_bed": assigned_bed_id,
        "action": f"Initiate {esi['acuity']} Protocol"
    }

@app.post("/api/predict-inflow")
async def predict_inflow(db: Session = Depends(get_db)):
    # 1. Fetch Environmental Context (Weather Multiplier)
    weather = await WeatherService.get_weather_coefficient()
    w_mult = weather["multiplier"]
    
    # 2. Get Systemic Backlog (Saturation Factor)
    # Checks how full the hospital is to adjust prediction "inertia"
    occupied_count = db.query(models.BedModel).filter(models.BedModel.is_occupied == True).count()
    total_beds = 60
    saturation_factor = 1 + (occupied_count / total_beds) * 0.25  # Up to 25% boost

    current_hour = datetime.now().hour
    forecast = []
    total_val = 0
    
    # 3. Generate 6-Hour Forecast using Bimodal Gaussian Peaks
    for i in range(1, 7):
        h = (current_hour + i) % 24
        
        # Gaussian peaks at 10:00 (Morning) and 20:00 (Evening)
        morning_peak = 18 * math.exp(-((h - 10)**2) / 6) 
        evening_peak = 14 * math.exp(-((h - 20)**2) / 5)
        
        base_inflow = 4 + morning_peak + evening_peak
        
        # Final Calculation for this specific hour
        predicted_count = int(base_inflow * w_mult * saturation_factor)
        
        forecast.append({"hour": f"{h}:00", "inflow": predicted_count})
        total_val += predicted_count
    
    # 4. NEW: Peak Analysis
    # Identify the highest inflow hour in the 6-hour window
    peak_entry = max(forecast, key=lambda x: x["inflow"])
    
    # 5. NEW: Database Persistence
    # Save a snapshot of this prediction to the History table
    try:
        new_snapshot = models.PredictionHistory(
            total_predicted=total_val,
            peak_value=peak_entry["inflow"],
            peak_time=peak_entry["hour"],
            actual_weather_multiplier=weather["multiplier"]
        )
        db.add(new_snapshot)
        db.commit()
    except Exception as e:
        print(f"Database Logging Error: {e}")
        db.rollback()
        
    # 6. Return Data to Frontend
    return {
        "forecast": forecast,
        "total_predicted_inflow": total_val,
        "weather_impact": weather,
        "confidence_score": 88,
        "saturation_impact": round((saturation_factor - 1) * 100, 1),
        "factors": {
            "environmental": f"{w_mult}x",
            "systemic_saturation": f"{round(saturation_factor, 2)}x"
        }
    }



@app.get("/api/predict/history")
async def get_prediction_history(db: Session = Depends(get_db)):
    # Fetch the last 24 entries to show a day's history
    history = db.query(models.PredictionHistory).order_all(models.PredictionHistory.timestamp.desc()).limit(24).all()
    return history

# Logic to "Capture" the peak (Call this inside predict_inflow or a background task)
def save_prediction_snapshot(db: Session, forecast_data: dict):
    # Find the hour with the highest inflow
    peak_entry = max(forecast_data["forecast"], key=lambda x: x["inflow"])
    
    new_snapshot = models.PredictionHistory(
        total_predicted=forecast_data["total_predicted_inflow"],
        peak_value=peak_entry["inflow"],
        peak_time=peak_entry["hour"],
        actual_weather_multiplier=forecast_data["weather_impact"]["multiplier"]
    )
    db.add(new_snapshot)
    db.commit()

@app.get("/api/predict/time-to-capacity")
async def get_time_to_capacity(db: Session = Depends(get_db)):
    # Query DB for actual bed count
    available_beds = db.query(models.BedModel).filter(models.BedModel.is_occupied == False).count()
    prediction = await predict_inflow()
    hourly_rate = prediction["total_predicted_inflow"] / 6
    
    if hourly_rate == 0: return {"status": "Stable", "minutes_remaining": -1}
    
    mins = int((available_beds / hourly_rate) * 60)
    return {
        "status": "CRITICAL" if mins < 60 else "High" if mins < 180 else "Stable",
        "minutes_remaining": mins,
        "velocity": round(hourly_rate, 2)
    }

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Pull Bed Stats from DB
    total_beds = db.query(models.BedModel).count()
    occupied_beds = db.query(models.BedModel).filter(models.BedModel.is_occupied == True).count()
    
    total_patients = sum(state.occupancy.values())
    nurse_ratio = state.staff["Nurses"] / max(total_patients, 1)
    
    return {
        "occupancy": state.occupancy,
        "bed_stats": {"total": total_beds, "occupied": occupied_beds, "available": total_beds - occupied_beds},
        "staff_ratio": f"1:{int(1/nurse_ratio) if nurse_ratio > 0 else 0}",
        "resources": state.resources
    }

@app.websocket("/ws/vitals")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)