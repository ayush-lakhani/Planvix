import requests
import json

base_url = "http://localhost:8000"

# Login first
login_data = {"email": "lakhaniayush@example.com", "password": "password123"}
login_response = requests.post(f"{base_url}/api/auth/login", json=login_data)

if login_response.status_code != 200:
    print("Login failed. Using test account...")
    login_data = {"email": "test@example.com", "password": "testpassword123"}
    login_response = requests.post(f"{base_url}/api/auth/login", json=login_data)
    if login_response.status_code != 200:
        print("Cannot login. Creating new account...")
        signup_response = requests.post(f"{base_url}/api/auth/signup", json=login_data)
        token = signup_response.json()["access_token"]
    else:
        token = login_response.json()["access_token"]
else:
    token = login_response.json()["access_token"]

print(f"Authenticated successfully!")

# Test with the exact data from the screenshot
strategy_data = {
    "goal": "coffeee selling",
    "audience": "collage student",
    "industry": "F&B (Food & Beverage)",
    "platform": "Instagram",
    "contentType": "Reels/Short Videos",
    "experience": "beginner"
}

print(f"\nTesting with data from screenshot:")
print(json.dumps(strategy_data, indent=2))

headers = {"Authorization": f"Bearer {token}"}
response = requests.post(f"{base_url}/api/strategy", json=strategy_data, headers=headers)

print(f"\nStatus: {response.status_code}")

if response.status_code == 422:
    print("\n422 VALIDATION ERROR DETAILS:")
    print("="*70)
    error_data = response.json()
    print(json.dumps(error_data, indent=2))
    
    if "detail" in error_data and isinstance(error_data["detail"], list):
        print("\nSUMMARY OF ERRORS:")
        for error in error_data["detail"]:
            field = " -> ".join(str(x) for x in error.get("loc", []))
            print(f"  • Field '{field}': {error.get('msg', 'Unknown error')}")
elif response.status_code == 200:
    print("\nSUCCESS! Strategy generated.")
else:
    print(f"\nResponse: {json.dumps(response.json(), indent=2)}")
