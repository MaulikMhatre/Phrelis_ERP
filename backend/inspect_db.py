import sqlite3
conn = sqlite3.connect('hospital_os.db')
cursor = conn.cursor()
cursor.execute('SELECT id, name, role FROM staff WHERE role="Ambulance"')
print("--- Ambulance Staff ---")
for row in cursor.fetchall():
    print(row)

cursor.execute('SELECT id, status FROM ambulances')
print("\n--- Ambulances ---")
for row in cursor.fetchall():
    print(row)
conn.close()
