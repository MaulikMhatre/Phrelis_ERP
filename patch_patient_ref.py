import sqlite3
conn = sqlite3.connect('backend/hospital_os.db')
cur = conn.cursor()
cur.execute("UPDATE blood_inventory SET assigned_patient_name = 'Simulated Emergency Case', assigned_patient_id = 'P-SIM-99' WHERE status = 'Reserved' AND assigned_patient_id IS NULL")
cur.execute("UPDATE blood_requests SET assigned_bag_id = 'P124RBC01' WHERE status = 'FULFILLED' AND assigned_bag_id IS NULL")
conn.commit()
conn.close()
