import sqlite3
from database import engine

def patch_ambulance_system():
    print("🚀 Phrelis OS: Initializing Database Patch...")
    
    # 1. Connect using standard sqlite3 (assuming hospital.db)
    # If you use PostgreSQL, let me know, the syntax changes slightly.
    conn = sqlite3.connect('hospital_os.db') 
    cursor = conn.cursor()

    try:
        # 2. Create the Emergency Sessions table if it doesn't exist
        print("🛠️ Creating 'emergency_sessions' table...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS emergency_sessions (
                id TEXT PRIMARY KEY,
                patient_lat REAL,
                patient_lng REAL,
                accuracy REAL,
                status TEXT DEFAULT 'LINK_SENT',
                ambulance_id TEXT,
                created_at DATETIME,
                FOREIGN KEY (ambulance_id) REFERENCES ambulances (id)
            )
        ''')

        # 3. Add 'ambulance_id' to existing tables if needed (Safety Check)
        # Note: If your EmergencySession model uses a FK to Ambulance, 
        # the Ambulance table must exist first.
        
        conn.commit()
        print("✅ Patch Applied Successfully: Emergency Tracking Enabled.")

    except Exception as e:
        print(f"❌ Patch Failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    patch_ambulance_system()