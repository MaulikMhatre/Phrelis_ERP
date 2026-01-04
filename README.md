# GFGBQ-Team-apicalypse
Repository for apicalypse - Vibe Coding Hackathon
PROBLEM STATEMENT- 06 :Predictive Hospital Resource & Emergency Load Intelligence System 
PROJECT NAME- PHRELIS:ADVANCED MEDICAL INTELLIGENCE
TEAM NAME-Apicalypse
DEPLOYED LINK-
2-minute Demonstration Video link-
PPT Link-

# 🏥 PHRELIS – Predictive Hospital Resource & Emergency Load Intelligence System

PHRELIS is an **AI-powered hospital operating system** that performs intelligent emergency triage, dynamically allocates beds, ventilators, medical staff, and ambulances, and predicts emergency inflow to prevent hospital overload.

---

## 📌 Project Overview

Modern hospitals face:
- Emergency patient surges
- ICU bed & ventilator shortages
- Doctor and nurse overload
- Delayed ambulance dispatch
- Reactive instead of predictive operations

**PHRELIS transforms hospital operations by enabling:**
- AI-assisted emergency triage (ESI-based)
- Automated ICU / ER bed allocation
- Intelligent ventilator assignment
- Real-time doctor & staff allocation
- Smart ambulance dispatch
- Predictive emergency inflow analytics
- Live system-wide updates via WebSockets

---

## 🚀 Core Features

### 🩺 Smart Triage & Admission
- Accepts **SpO₂, heart rate, and symptoms**
- Automatically determines **ESI level**
- Assigns:
  - ICU / ER bed
  - Ventilator (critical cases)
  - Attending doctor
  - Nursing staff
- Generates AI-based clinical justification

---

### 👨‍⚕️ Staff & Doctor Allocation
- Doctors assigned based on:
  - Availability
  - Specialty relevance
  - Current workload
- Nurses allocated using safe **patient-to-staff ratios**
- Prevents staff overload and burnout
- Updates assignments in real time

---

### 🚑 Ambulance Dispatch System
- Automatically dispatches ambulances for:
  - Critical ESI-1 & ESI-2 patients
  - Emergency referrals
- Tracks:
  - Available ambulances
  - Active deployments
- Live ambulance readiness indicators


## 🧪 Usage Instructions
  
- Open the **Smart Triage Portal**.
- Enter patient vitals:
   - **SpO₂ (%)**
   - **Heart Rate (BPM)**
   - **Symptoms** (comma-separated)
- Click **Assess & Admit Patient**.
- PHRELIS automatically:
   - Assigns the **ESI triage level**
   - Allocates an **ICU / ER bed**
   - Allocates a **ventilator** for critical patients
   - Assigns an available **doctor and nursing staff**
   - Dispatches an **ambulance** if required
- All updates appear **instantly on the dashboard** via real-time synchronization.


## 🛠 Tech Stack

### Frontend
- Next.js (React)
- TypeScript
- Tailwind CSS
- WebSockets (real-time UI updates)

### Backend
- FastAPI
- SQLAlchemy ORM
- SQLite / PostgreSQL
- LangChain + Google Gemini (AI reasoning)
- WebSockets

## ⚙️ Setup & Installation Instructions

### 1️⃣ Clone the Repository
git clone https://github.com/your-username/phrelis-hospital-os.git
cd phrelis-hospital-os

### 2️⃣ Backend Setup (FastAPI)

### Navigate to the backend directory:
cd backend

### Create and activate a virtual environment:
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

### Install backend dependencies:
pip install -r requirements.txt

### Create a .env file in the backend directory:
GOOGLE_API_KEY=your_google_gemini_api_key

### Start the FastAPI server:
uvicorn main:app --reload

### Backend will run at:
http://localhost:8000

### 3️⃣ Frontend Setup (Next.js)

### Navigate to the frontend directory:
cd frontend
Install frontend dependencies:
npm install

### Start the development server:
npm run dev

### Frontend will run at:
http://localhost:3000


## Screenshots:

![Alternative Text]("C:\Users\patel\Downloads\main.jpeg")
![Alternative Text]("C:\Users\patel\Downloads\Dashboard.jpeg")
![Alternative Text]("C:\Users\patel\Downloads\analytics.jpeg")
![Alternative Text]("C:\Users\patel\Downloads\sentinel.jpeg")
