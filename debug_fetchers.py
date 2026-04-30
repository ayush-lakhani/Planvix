import requests
import sys

BASE_URL = "http://localhost:8000"

ENDPOINTS = [
    {"path": "/", "method": "GET", "auth": False},
    {"path": "/health", "method": "GET", "auth": False},
    {"path": "/api/health", "method": "GET", "auth": False},
    {"path": "/api/auth/login", "method": "POST", "auth": False},
    {"path": "/api/feedback", "method": "POST", "auth": False, "payload": {"strategy_id": "test_id", "rating": 5}},
    {"path": "/api/strategies/test_id/blueprint", "method": "POST", "auth": False},
]

def test_backend():
    print(f"Testing Backend at {BASE_URL}...")
    for ep in ENDPOINTS:
        try:
            url = f"{BASE_URL}{ep['path']}"
            if ep['method'] == "GET":
                resp = requests.get(url, timeout=5)
            else:
                payload = ep.get("payload", {})
                resp = requests.post(url, json=payload, timeout=5)
            
            print(f"[ {resp.status_code} ] {ep['method']} {ep['path']}")
        except requests.exceptions.ConnectionError:
            print(f"[ FAIL ] {ep['method']} {ep['path']} (Connection Refused - Is backend running?)")
        except Exception as e:
            print(f"[ ERROR ] {ep['method']} {ep['path']} ({str(e)})")

if __name__ == "__main__":
    test_backend()
