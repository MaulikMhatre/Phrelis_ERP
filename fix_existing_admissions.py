import sqlite3
import uuid
from datetime import datetime

def fix_active_admissions():
    conn = sqlite3.connect('backend/hospital_os.db')
    cursor = conn.cursor()
    
    print("Checking for inconsistent bed-admission states...")
    
    # 1. Find beds that are occupied but have no admission_uid
    cursor.execute("""
        SELECT id, patient_name FROM beds 
        WHERE is_occupied = 1 AND (admission_uid IS NULL OR admission_uid = '')
    """)
    broken_beds = cursor.fetchall()
    
    for bed_id, patient_name in broken_beds:
        print(f"Fixing Bed {bed_id} for patient {patient_name}...")
        
        # Check if an active admission already exists for this patient/bed
        cursor.execute("""
            SELECT admission_uid FROM admissions 
            WHERE bed_id = ? AND status = 'ACTIVE' AND patient_name = ?
        """, (bed_id, patient_name))
        existing = cursor.fetchone()
        
        if existing:
            uid = existing[0]
            print(f"  Found existing admission: {uid}")
        else:
            uid = f"ADM-FIX-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
            print(f"  Creating new virtual admission: {uid}")
            # Create a basic admission record so billing integration works
            cursor.execute("""
                INSERT INTO admissions (admission_uid, bed_id, patient_name, status, admission_time)
                VALUES (?, ?, ?, 'ACTIVE', ?)
            """, (uid, bed_id, patient_name, datetime.now()))
            
        # Link it to the bed
        cursor.execute("UPDATE beds SET admission_uid = ? WHERE id = ?", (uid, bed_id))
        
    conn.commit()
    conn.close()
    print("Correction complete.")

if __name__ == "__main__":
    fix_active_admissions()
