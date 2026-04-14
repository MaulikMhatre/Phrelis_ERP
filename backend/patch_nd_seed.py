import sqlite3

def patch_and_seed():
    conn = sqlite3.connect("hospital_os.db")
    cursor = conn.cursor()

    # 1. Fix the Patient Table
    cursor.execute("PRAGMA table_info(patients)")
    columns = [col[1] for col in cursor.fetchall()]
    if "blood_group" not in columns:
        print("Adding blood_group to patients...")
        cursor.execute("ALTER TABLE patients ADD COLUMN blood_group VARCHAR")

    # 2. Insert a valid Patient for testing
    # Note: Replace 'TEST-UUID-123' with whatever ID your frontend is actually sending
    cursor.execute("""
        INSERT OR REPLACE INTO patients (id, patient_name, blood_group, condition, timestamp) 
        VALUES ('TEST-PATIENT-001', 'Maulik Mhatre', 'O+', 'Stable', '2026-04-14 00:00:00')
    """)

    # 3. Insert a valid Blood Bag for testing
    cursor.execute("""
        INSERT OR REPLACE INTO blood_inventory (bag_id, blood_group, component_type, status, is_tested, expiry_date) 
        VALUES ('BAG-O-POSITIVE-001', 'O+', 'Whole Blood', 'Available', 1, '2026-05-14 00:00:00')
    """)

    conn.commit()
    conn.close()
    print("✅ Patched: You can now test /api/blood/reserve with Bag: BAG-O-POSITIVE-001 and Patient: TEST-PATIENT-001")

if __name__ == "__main__":
    patch_and_seed()