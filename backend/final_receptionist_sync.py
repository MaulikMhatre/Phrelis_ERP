import sqlite3
import os

# Configuration
DB_NAME = "hospital_os.db" 

def finalize_financial_db():
    if not os.path.exists(DB_NAME):
        print(f"❌ Error: {DB_NAME} not found.")
        return

    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        print(f"--- PHRELIS DB: FINALIZING FINANCIAL ARCHITECTURE ---")

        # 1. Create the permanent PAID_BILLS archive
        # We include 'contact_info' so the receptionist can log where the bill was sent
        create_paid_bills = """
        CREATE TABLE IF NOT EXISTS paid_bills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_no TEXT UNIQUE,
            admission_uid TEXT,
            patient_name TEXT,
            amount_paid REAL,
            payment_method TEXT,
            transaction_id TEXT,
            contact_info TEXT, 
            paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            processed_by_staff TEXT
        );
        """
        cursor.execute(create_paid_bills)
        print("✅ Table 'paid_bills' verified/created (Permanent Ledger).")

        # 2. Add 'bill_no' to consultation_logs if missing
        # This allows the receptionist to mark OPD consultations as 'Billed'
        try:
            cursor.execute("ALTER TABLE consultation_logs ADD COLUMN bill_no TEXT")
            print("✅ Linked: 'bill_no' added to consultation_logs.")
        except sqlite3.OperationalError:
            print("ℹ️ Relational link already exists in consultation_logs.")

        conn.commit()
        print(f"--- SUCCESS: DATABASE IS READY FOR RECEPTIONIST DISPATCH ---")

    except Exception as e:
        print(f"❌ Migration Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    finalize_financial_db()