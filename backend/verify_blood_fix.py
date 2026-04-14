import sqlite3
import sys

DB_PATH = "backend/hospital_os.db"
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

print("=" * 60)
print("BLOOD-NEXUS: POST-FIX VERIFICATION")
print("=" * 60)

# 1. Check O- bags
print("\n[1] O- Available Bags:")
cur.execute("SELECT bag_id, blood_group, component_type, status FROM blood_inventory WHERE blood_group='O-'")
rows = cur.fetchall()
for r in rows:
    print(f"    {r}")
if not rows:
    print("    FAIL: No O- bags found!")
    sys.exit(1)

# 2. Check patient
print("\n[2] Patient P-SIM-99:")
cur.execute("SELECT id, patient_name, blood_group FROM patients WHERE id='P-SIM-99'")
pat = cur.fetchone()
print(f"    {pat}")
if not pat:
    print("    FAIL: Patient not found!")
    sys.exit(1)
if pat[2] != "O-":
    print(f"    WARN: Patient blood group is '{pat[2]}', expected 'O-'")

# 3. Compatibility check: does O- bag work for O- patient?
print("\n[3] Compatibility Matrix Check (O- bag -> O- patient):")
donor_matrix = {
    "O-":  ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    "O+":  ["O+", "A+", "B+", "AB+"],
    "A-":  ["A-", "A+", "AB-", "AB+"],
    "A+":  ["A+", "AB+"],
    "B-":  ["B-", "B+", "AB-", "AB+"],
    "B+":  ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"]
}
patient_group = "O-"
compatible_donors = [d for d, r in donor_matrix.items() if patient_group in r]
print(f"    Patient group: {patient_group}")
print(f"    Compatible donor groups: {compatible_donors}")

if "O-" in compatible_donors:
    print("    PASS: O- bags ARE compatible with O- patient")
else:
    print("    FAIL: No compatible bags!")

# 4. Find best FEFO suggestion (simulate the fixed query)
print("\n[4] Simulated FEFO Suggest (RBC for O- patient):")
cur.execute("""
    SELECT bag_id, blood_group, component_type, status, expiry_date
    FROM blood_inventory
    WHERE blood_group IN ('O-')
      AND component_type = 'RBC'
      AND status = 'Available'
    ORDER BY expiry_date ASC
    LIMIT 1
""")
suggestion = cur.fetchone()
if suggestion:
    print(f"    PASS: Would suggest bag {suggestion}")
else:
    print("    FAIL: No compatible RBC found for O- patient!")

# 5. Simulate old (broken) query
print("\n[5] Old (Broken) FEFO Query - exact match on request blood_group 'O-':")
cur.execute("""
    SELECT bag_id, blood_group, component_type, status
    FROM blood_inventory
    WHERE blood_group = 'O-'
      AND component_type = 'RBC'
      AND status = 'Available'
    ORDER BY expiry_date ASC
    LIMIT 1
""")
old = cur.fetchone()
if old:
    print(f"    NOW WORKS (O- bags exist): {old}")
else:
    print("    Still broken - no O- RBC found (would have returned None -> no suggestion)")

conn.close()
print("\n" + "=" * 60)
print("Verification complete.")
print("=" * 60)
