import sqlite3

conn = sqlite3.connect("backend/hospital_os.db")
cur = conn.cursor()

# Check patient P-SIM-99 (check both 'patients' and 'patient_records' table)
print("=== Checking tables ===")
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [t[0] for t in cur.fetchall()]
print("Tables:", tables)

print("\n=== Patient P-SIM-99 (patient_records) ===")
if "patient_records" in tables:
    cur.execute("SELECT id, patient_name, blood_group FROM patient_records WHERE id=?", ("P-SIM-99",))
    print(cur.fetchone())

print("\n=== Patient P-SIM-99 (patients) ===")
if "patients" in tables:
    cur.execute("SELECT id, patient_name, blood_group FROM patients WHERE id=?", ("P-SIM-99",))
    print(cur.fetchone())

print("\n=== Bag P126163073 ===")
if "blood_inventory" in tables:
    cur.execute("SELECT bag_id, blood_group, component_type, status, is_tested FROM blood_inventory WHERE bag_id=?", ("P126163073",))
    print(cur.fetchone())

print("\n=== All Available Blood Bags ===")
if "blood_inventory" in tables:
    cur.execute("SELECT bag_id, blood_group, component_type, status FROM blood_inventory WHERE status='Available'")
    for row in cur.fetchall():
        print(row)

print("\n=== Blood Compatibility Matrix (O- can donate to all) ===")
print("If bag blood_group=O- and patient blood_group=O-, result: COMPATIBLE")
print("If bag blood_group != O- and patient blood_group not in compatible list: 403 SAFETY BREACH")

conn.close()
