import sys
import os
import asyncio

# Correct Import Path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models 
from database import SQLALCHEMY_DATABASE_URL
from inventory_service import InventoryService

# Existing DB Connection
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class MockManager:
    async def broadcast(self, msg):
        print(f"[MOCK WS] {msg}")

async def test_cleaning_deduction():
    db = TestingSessionLocal()
    print("--- Testing Bed Turnover Deduction ---")

    # 1. Setup/Ensure Item Exists (Simulating Seed)
    for name in ["Sanitization Kit", "Bed Linens"]:
        item = db.query(models.InventoryItem).filter_by(name=name).first()
        if not item:
            item = models.InventoryItem(name=name, category="General", quantity=100, reorder_level=10)
            db.add(item)
            db.commit()
            print(f"Created Test Item: {name}")
        else:
             print(f"Found Existing Item: {name} (Qty: {item.quantity})")

    # Capture Start Qty
    kit_start = db.query(models.InventoryItem).filter_by(name="Sanitization Kit").first().quantity
    linens_start = db.query(models.InventoryItem).filter_by(name="Bed Linens").first().quantity

    # 2. Simulate Cleaning Hook
    manager = MockManager()
    print("\n[ACTION] Triggering Cleaning Deduction...")
    await InventoryService.process_usage(
        db, manager, "Cleaning", 
        {"patient_name": "Bed Turnover Test", "bed_id": "TEST-1", "condition": "Standard Cleaning"}
    )
    
    # 3. Verify Deduction
    db.expire_all() # reloading from DB
    
    kit_end = db.query(models.InventoryItem).filter_by(name="Sanitization Kit").first().quantity
    linens_end = db.query(models.InventoryItem).filter_by(name="Bed Linens").first().quantity
    
    print(f"\n[RESULT] Sanitization Kit: {kit_start} -> {kit_end}")
    print(f"[RESULT] Bed Linens:      {linens_start} -> {linens_end}")
    
    if kit_end == kit_start - 1 and linens_end == linens_start - 1:
        print("✅ PASS: Correctly deducted 1 of each item.")
    else:
        print("❌ FAIL: Deduction incorrect.")

    db.close()

if __name__ == "__main__":
    asyncio.run(test_cleaning_deduction())
