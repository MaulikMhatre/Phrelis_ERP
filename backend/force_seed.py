import models
from database import SessionLocal, engine
from datetime import datetime, timedelta
from passlib.context import CryptContext

# Security config matching your main app
PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return PWD_CONTEXT.hash(password)

def force_seed():
    db = SessionLocal()
    print("🚀 Phrelis OS: Force Seeding Started...")

    try:
        # 1. Ensure Tables Exist
        models.Base.metadata.create_all(bind=engine)

        # 2. Seed Blood Manager (BM-01)
        # We use 'password123' as raw and hashed for dev flexibility
        bm_id = "BM-01"
        existing_bm = db.query(models.Staff).filter_by(id=bm_id).first()
        
        if not existing_bm:
            print(f"➕ Adding Blood Manager: {bm_id}")
            bm_staff = models.Staff(
                id=bm_id,
                name="Rahul Varma",
                role="BloodManager",
                is_clocked_in=True,
                hashed_password=get_password_hash("password123")
            )
            db.add(bm_staff)
        else:
            print(f"✔ Blood Manager {bm_id} already exists.")

        # 3. Seed NGO Partner (NGO-01)
        ngo_id = "NGO-01"
        existing_ngo = db.query(models.Staff).filter_by(id=ngo_id).first()
        if not existing_ngo:
            print(f"➕ Adding NGO Partner: {ngo_id}")
            ngo_staff = models.Staff(
                id=ngo_id,
                name="Red Cross Phrelis",
                role="NGOPartner",
                is_clocked_in=True,
                hashed_password=get_password_hash("password123")
            )
            db.add(ngo_staff)

        # 4. Seed Simulation Patient (P-SIM-99) - The 404 Fix
        sim_id = "P-SIM-99"
        existing_patient = db.query(models.PatientRecord).filter_by(id=sim_id).first()
        if not existing_patient:
            print(f"➕ Adding Simulation Patient: {sim_id}")
            new_patient = models.PatientRecord(
                id=sim_id,
                patient_name="Simulated Emergency Case",
                blood_group="O-"
            )
            db.add(new_patient)
        else:
            existing_patient.blood_group = "O-" # Reset for compatibility tests

        # 5. Seed Inventory Unit (P1240001)
        bag_id = "P1240001"
        existing_bag = db.query(models.BloodInventory).filter_by(bag_id=bag_id).first()
        if not existing_bag:
            print(f"➕ Adding Blood Bag: {bag_id}")
            new_bag = models.BloodInventory(
                bag_id=bag_id,
                donor_id="D-101",
                blood_group="O-",
                component_type="Whole Blood",
                expiry_date=datetime.utcnow() + timedelta(days=21),
                status="Available",
                is_tested=True
            )
            db.add(new_bag)

        db.commit()
        print("✨ Seeding Complete! hospital.db is now synchronized.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    force_seed()