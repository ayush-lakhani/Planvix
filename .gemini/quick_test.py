import requests
import json

base_url = "http://localhost:8000"

# Login with existing account
login_data = {
    "email": "test@example.com",
    "password": "testpassword123"
}

print("Logging in...")
login_response = requests.post(f"{base_url}/api/auth/login", json=login_data)

if login_response.status_code != 200:
    print(f"Login failed: {login_response.json()}")
    print("Creating new account...")
    # Try different email
    login_data["email"] = f"test{hash(str(login_data))}@example.com"
    signup_response = requests.post(f"{base_url}/api/auth/signup", json=login_data)
    if signup_response.status_code == 200:
        token = signup_response.json()["access_token"]
        print("Account created!")
    else:
        print(f"Failed: {signup_response.json()}")
        exit(1)
else:
    token = login_response.json()["access_token"]
    print("Logged in successfully!")

# Test strategy endpoint
print("\nTesting /api/strategy endpoint...")
strategy_data = {
    "goal": "Sell coffee subscriptions on Instagram",
    "audience": "College students aged 18-24",
    "industry": "F&B (Food & Beverage)",
    "platform": "Instagram",
    "contentType": "Mixed Content",
    "experience": "beginner"
}

headers = {"Authorization": f"Bearer {token}"}

response = requests.post(f"{base_url}/api/strategy", json=strategy_data, headers=headers)

print(f"Status: {response.status_code}")

if response.status_code == 422:
    print("\n422 VALIDATION ERROR:")
    print(json.dumps(response.json(), indent=2))
elif response.status_code == 200:
    print("\nSUCCESS!")
else:
    print(f"\nResponse: {json.dumps(response.json(), indent=2)}")
