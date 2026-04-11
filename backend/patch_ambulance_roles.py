import sqlite3
from datetime import datetime

def patch_roles():
    print("🚀 Phrelis OS: Updating Staff Roles & Emergency Infrastructure...")
    
    # Connect to your existing database
    conn = sqlite3.connect('hospital_os.db') 
    cursor = conn.cursor()

    try:
        # 1. Add Ambulance Drivers to the Staff Table
        # We add 2 drivers as an example. Role must be 'Ambulance' to match middleware.
        drivers = [
            ('AMB-DRIVER-01', 'Rajesh Kumar', 'Ambulance', True, 'driver123'),
            ('AMB-DRIVER-02', 'Suresh Pal', 'Ambulance', True, 'driver123')
        ]
        
        print("👤 Seeding Ambulance Driver accounts...")
        for driver in drivers:
            cursor.execute('''
                INSERT OR IGNORE INTO staff (id, name, role, is_clocked_in, hashed_password)
                VALUES (?, ?, ?, ?, ?)
            ''', driver)

        # 2. Add an 'assigned_mission' column to staff if you want to track active jobs
        # This is optional but helps with the Driver Login logic
        try:
            cursor.execute('ALTER TABLE staff ADD COLUMN active_mission_id TEXT')
            print("📝 Added active_mission_id to Staff table.")
        except sqlite3.OperationalError:
            print("ℹ️ active_mission_id column already exists.")

        # 3. Ensure the Ambulances table exists and has IDs matching the drivers
        # It's better if the Staff ID for the driver is linked to an Ambulance ID
        cursor.execute('''
            UPDATE ambulances SET status = 'IDLE' WHERE status IS NULL
        ''')

        conn.commit()
        print("✅ Database successfully patched with Ambulance roles.")

    except Exception as e:
        print(f"❌ Patch Failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    patch_roles()