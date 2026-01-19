import sys
import os

# Add backend to path so we can import 'models' and 'main' directly, 
# matching how they import each other.
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
# Import directly from the names exposed to main.py
import models 
from database import SQLALCHEMY_DATABASE_URL
from main import get_inventory_forecast
from datetime import datetime, timedelta

# Existing DB Connection
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_forecast_logic():
    db = TestingSessionLocal()
    print("--- Testing Inventory Forecast Logic ---")

    # 1. Setup Test Item
    test_item_name = "Forecast_Test_Item"
    item = db.query(models.InventoryItem).filter_by(name=test_item_name).first()
    if not item:
        item = models.InventoryItem(name=test_item_name, category="Test", quantity=100, reorder_level=10)
        db.add(item)
        db.commit()
        db.refresh(item)
    
    # 2. Reset Logs for this item
    db.query(models.InventoryLog).filter(models.InventoryLog.item_id == item.id).delete()
    db.commit()

    # 3. Insert specific usage logs to control Burn Rate
    # Target: Burn rate of 10 units/hr = 60 units in last 6 hours
    now = datetime.utcnow()
    logs = []
    for i in range(6):
        logs.append(models.InventoryLog(
            item_id=item.id,
            patient_name="Test Sim",
            quantity_used=10, 
            timestamp=now - timedelta(hours=i),
            reason="Test Burn"
        ))
    db.add_all(logs)
    db.commit()

    # 4. Trigger Forecast
    # Mock Dependency Injection
    results = get_inventory_forecast(db)
    
    target_result = next((r for r in results if r["name"] == test_item_name), None)
    
    if target_result:
        print(f"\n[RESULT] Item: {target_result['name']}")
        print(f"  Qty: {target_result['quantity']}")
        print(f"  Burn Rate: {target_result['burn_rate']} (Expected ~10.0)")
        print(f"  Hours Remaining: {target_result['hours_remaining']}")
        print(f"  Status: {target_result['status']}")
        print(f"  Load Multipler: {target_result['load_multiplier']}")
        
        # Validation
        base_rate = 10.0
        multiplier = target_result['load_multiplier']
        expected_rate = base_rate * multiplier
        
        if abs(target_result['burn_rate'] - expected_rate) < 0.1:
             print("✅ PASS: Burn Rate Calculation Accuracy")
        else:
             print(f"❌ FAIL: Burn Rate Mismatch. Got {target_result['burn_rate']}, Expected {expected_rate}")
             
        # Exhaustion
        # 100 qty / rate
        expected_hours = 100 / expected_rate
        if abs(target_result['hours_remaining'] - expected_hours) < 0.5:
             print("✅ PASS: Exhaustion Time Accuracy")
        else:
             print(f"❌ FAIL: Exhaustion Time Mismatch. Eq: {target_result['hours_remaining']} vs Exp: {expected_hours}")
             
    else:
        print("❌ FAIL: Test item not found in forecast results")

    # Clean up
    db.query(models.InventoryLog).filter(models.InventoryLog.item_id == item.id).delete()
    db.delete(item)
    db.commit()
    db.close()

if __name__ == "__main__":
    test_forecast_logic()
