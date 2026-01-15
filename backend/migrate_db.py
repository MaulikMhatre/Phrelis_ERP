# from database import engine, SessionLocal
# from sqlalchemy import text
# import models
# def migrate():
#     with engine.connect() as conn:
#         print("Migrating Database...")
#         try:
#             # Check if columns exist (naive check or just try adding them)
#             # SQLite doesn't support IF NOT EXISTS in ALTER TABLE ADD COLUMN universally in older versions, 
#             # but usually it's fine. We'll try/except each.
            
#             columns = [
#                 "ALTER TABLE beds ADD COLUMN current_state VARCHAR DEFAULT 'AVAILABLE'",
#                 "ALTER TABLE beds ADD COLUMN expected_end_time DATETIME",
#                 "ALTER TABLE beds ADD COLUMN cleanup_start_time DATETIME",
#                 "ALTER TABLE beds ADD COLUMN next_surgery_start_time DATETIME",
#                 "ALTER TABLE beds ADD COLUMN surgeon_name VARCHAR"
#             ]
            
#             for col in columns:
#                 try:
#                     conn.execute(text(col))
#                     print(f"Executed: {col}")
#                 except Exception as e:
#                     print(f"Skipped (probably exists): {col} | Error: {e}")
                    
#             conn.commit()
#             print("Migration Complete.")
            
#         except Exception as e:
#             print(f"Migration Failed: {e}")

# if __name__ == "__main__":
#     migrate()




from database import engine
import models  # This must be imported to register your classes

def migrate():
    print("Synchronizing Database Schema...")
    try:
        # This command creates all tables defined in models.py 
        # (hospital_beds, surgery_history, etc.) with all their current columns.
        models.Base.metadata.create_all(bind=engine)
        print("Success: All tables and columns are now synchronized.")
    except Exception as e:
        print(f"Migration Failed: {e}")

if __name__ == "__main__":
    migrate()