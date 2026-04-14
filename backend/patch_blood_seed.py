"""
Live DB Patch: Inject O- pre-processed blood component bags.
Run this once to fix the existing database without needing to reset/reseed.
"""
import sqlite3
from datetime import datetime, timedelta

DB_PATH = "backend/hospital_os.db"
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# Check what bags already exist
cur.execute("SELECT bag_id FROM blood_inventory")
existing_ids = {row[0] for row in cur.fetchall()}
print("Existing bag IDs:", existing_ids)

# O- bags to inject
now = datetime.utcnow()
bags_to_add = [
    ("P124RBC01", "D-101", "O-", "RBC",      (now + timedelta(days=35)).isoformat(),  "Available", 1),
    ("P124PLS01", "D-101", "O-", "Plasma",   (now + timedelta(days=365)).isoformat(), "Available", 1),
    ("P124PLT01", "D-101", "O-", "Platelets",(now + timedelta(days=5)).isoformat(),   "Available", 1),
]

injected = 0
for bag in bags_to_add:
    bag_id = bag[0]
    if bag_id in existing_ids:
        print(f"  SKIP (already exists): {bag_id}")
        continue
    cur.execute("""
        INSERT INTO blood_inventory (bag_id, donor_id, blood_group, component_type, expiry_date, status, is_tested)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, bag)
    print(f"  INSERTED: {bag_id} ({bag[2]} {bag[3]})")
    injected += 1

conn.commit()
conn.close()
print(f"\n✅ Patch complete. {injected} bag(s) injected into live DB.")
