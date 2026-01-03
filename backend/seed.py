# backend/seed.py
from database import SessionLocal, engine, Base
from models import BedModel

def seed_beds():
    # STEP 1: Create the tables if they don't exist
    # This fixes the "no such table: beds" error
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    
    try:
        # STEP 2: Check if beds already exist
        if db.query(BedModel).count() > 0:
            print("Beds already initialized in the database.")
            return

        print("Seeding beds...")
        beds = []
        # Initialize 20 ICU beds
        for i in range(1, 21):
            beds.append(BedModel(id=f"ICU-{i}", type="ICU", is_occupied=False))
        
        # Initialize 40 ER beds
        for i in range(1, 41):
            beds.append(BedModel(id=f"ER-{i}", type="ER", is_occupied=False))

        db.add_all(beds)
        db.commit()
        print("Successfully seeded 60 hospital beds.")
        
    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_beds()