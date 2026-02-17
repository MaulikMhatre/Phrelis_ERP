import requests
import sqlite3

def test_all_uids():
    conn = sqlite3.connect('backend/hospital_os.db')
    cursor = conn.cursor()
    cursor.execute('SELECT admission_uid FROM admissions')
    uids = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    print(f"Found {len(uids)} UIDs in DB: {uids}")
    
    for uid in uids:
        url = f"http://127.0.0.1:8000/api/finance/bill/{uid}"
        try:
            res = requests.get(url, timeout=5)
            print(f"UID: {uid} | Status: {res.status_code}")
            if res.status_code != 200:
                print(f"  Response: {res.text}")
        except Exception as e:
            print(f"UID: {uid} | Error: {e}")

if __name__ == "__main__":
    test_all_uids()
