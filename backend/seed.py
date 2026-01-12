
from database import SessionLocal, engine, Base
import models 

def seed_beds():
    print("Initializing system infrastructure...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Seed Beds (Keep this: these are physical assets)
        if db.query(models.BedModel).count() == 0:
            print("Seeding beds...")
            beds = []
            for i in range(1, 21):
                beds.append(models.BedModel(id=f"ICU-{i}", type="ICU", is_occupied=False, status="AVAILABLE"))
            for i in range(1, 41):
                beds.append(models.BedModel(id=f"ER-{i}", type="ER", is_occupied=False, status="AVAILABLE"))
            db.add_all(beds)

        # 2. Seed Staff (Keep this: needed to log in and take patients)
        if db.query(models.Staff).count() == 0:
            print("Seeding staff...")
            staff_members = [
                models.Staff(id="N-01", name="Nurse Jackie", role="Nurse", hashed_password="password123", is_clocked_in=True),
                models.Staff(id="D-01", name="Dr. House", role="Doctor", hashed_password="password123", is_clocked_in=True)
            ]
            db.add_all(staff_members)

        db.commit()
        print("Infrastructure ready. System is now a blank slate for admissions.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_beds()




















