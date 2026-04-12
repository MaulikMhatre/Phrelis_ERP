import sys
import os
# Import your database and models 
from database import SessionLocal, engine
import models

def seed_infrastructure():
    db = SessionLocal()
    try:
        print("🏗️  Phrelis OS: Expanding Hospital Infrastructure...")

        # Updated config to match your existing BedModel columns
        # We will use 'type' for filtering logic
        infrastructure_config = [
            ("OT", "OT", 5),         # 5 Operating Theaters
        ]

        total_added = 0

        for bed_type, prefix, count in infrastructure_config:
            for i in range(1, count + 1):
                bed_id = f"{prefix}-{str(i).zfill(2)}"
                
                # Check if bed already exists
                existing_bed = db.query(models.BedModel).filter(models.BedModel.id == bed_id).first()
                
                if not existing_bed:
                    # Only passing arguments that EXIST in your models.py
                    new_bed = models.BedModel(
                        id=bed_id,
                        type=bed_type,
                        is_occupied=False,
                        status="AVAILABLE",
                        ventilator_in_use=False
                    )
                    db.add(new_bed)
                    total_added += 1
                    print(f"✅ Created {bed_type}: {bed_id}")
                else:
                    print(f"⏩ Skipping {bed_id} (Already exists)")

        db.commit()
        print(f"\n✨ Successfully seeded {total_added} new resources.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding OT beds: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_infrastructure()