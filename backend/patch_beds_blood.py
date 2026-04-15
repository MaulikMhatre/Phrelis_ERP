import sqlite3
conn = sqlite3.connect('backend/hospital_os.db')
cur = conn.cursor()
cur.execute("UPDATE beds SET patient_blood_group = 'O-' WHERE id = 'ICU-1'")
cur.execute("UPDATE beds SET patient_blood_group = 'B+' WHERE id = 'ER-1'")
conn.commit()
conn.close()
print("Beds patched.")
