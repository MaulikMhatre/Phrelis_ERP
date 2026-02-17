import requests
import sys

def test_uid(uid):
    url = f"http://127.0.0.1:8000/api/finance/bill/{uid}"
    print(f"Testing {uid} at {url}")
    try:
        res = requests.get(url, timeout=5)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    uids = ["ADM-20260215-1750", "ADM-SRG-20260215-52FD", "NON-EXISTENT"]
    if len(sys.argv) > 1:
        uids = [sys.argv[1]]
    for uid in uids:
        test_uid(uid)
        print("-" * 20)
