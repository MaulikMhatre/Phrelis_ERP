import sqlite3

conn = sqlite3.connect('backend/hospital_os.db')
cur = conn.cursor()

prices = {
    'O-': 2500,
    'O+': 2000,
    'A-': 2200,
    'A+': 1800,
    'B-': 2100,
    'B+': 1800,
    'AB-': 2400,
    'AB+': 1700
}

for bg, price in prices.items():
    cur.execute("UPDATE blood_inventory SET price = ? WHERE blood_group = ?", (price, bg))

# Update specific simulation patient
cur.execute("UPDATE patients SET blood_group = 'O-' WHERE id = 'P-SIM-99'")

# Update others without LIMIT
cur.execute("UPDATE patients SET blood_group = 'B+' WHERE id LIKE 'P-SIM-%' AND id != 'P-SIM-99'")

conn.commit()
conn.close()
print("Data patch complete.")
