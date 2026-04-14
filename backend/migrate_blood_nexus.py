import sqlite3

def migrate():
    db_path = "hospital_os.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Columns to add to specific tables
    migrations = {
        "patients": [
            ("blood_group", "VARCHAR"),
            ("rh_factor", "VARCHAR")
        ],
        "blood_inventory": [
            ("is_tested", "BOOLEAN DEFAULT 0"),
            ("test_results", "JSON"),
            ("parent_bag_id", "VARCHAR"),
            ("processed_by_staff", "VARCHAR")
        ]
    }

    for table, columns in migrations.items():
        # Get existing columns
        cursor.execute(f"PRAGMA table_info({table})")
        existing_cols = [col[1] for col in cursor.fetchall()]

        for col_name, col_type in columns:
            if col_name not in existing_cols:
                print(f"🔧 Adding {col_name} to {table}...")
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}")
            else:
                print(f"✅ {table}.{col_name} already exists.")

    conn.commit()
    conn.close()
    print("🚀 Database Migration Complete. No data was deleted.")

if __name__ == "__main__":
    migrate()