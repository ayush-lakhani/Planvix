"""
Test with the EXACT data from the user's console screenshot
"""
import requests
import json

base_url = "http://localhost:8000"

# Create fresh account
import random
email = f"test{random.randint(100000,999999)}@test.com"
password = "password123"

signup = requests.post(f"{base_url}/api/auth/signup", json={"email": email, "password": password})
token = signup.json()["access_token"]

# EXACT data from screenshot
data = {
    "audience": "collage student age of 18 - 25",
    "contentType": "Reels/Short Videos",
    "experience": "beginner",
    "goal": "sell coffee subscription on instagram",
    "industry": "Coffee & Tea",
    "platform": "Instagram"
}

print("Testing with EXACT screenshot data:")
print(json.dumps(data, indent=2))

response = requests.post(
    f"{base_url}/api/strategy",
    json=data,
    headers={"Authorization": f"Bearer {token}"}
)

print(f"\nStatus: {response.status_code}")

if response.status_code == 422:
    print("\n422 ERROR DETAILS:")
    error = response.json()
    print(json.dumps(error, indent=2))
    
    if "detail" in error and isinstance(error["detail"], list):
        print("\nVALIDATION ERRORS:")
        for e in error["detail"]:
            print(f"  - {e.get('loc', [])}: {e.get('msg', '')}")
elif response.status_code == 200:
    print("\nSUCCESS!")
    print(f"Strategy ID: {response.json().get('strategy', {}).get('_id')}")
else:
    print(f"\nResponse: {response.json()}")
