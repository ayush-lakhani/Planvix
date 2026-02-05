import requests
import json

# First, let's create a test user and get a token
base_url = "http://localhost:8000"

# Test signup
signup_data = {
    "email": "test@example.com",
    "password": "testpassword123"
}

print("=" * 60)
print("TESTING STRATEGY ENDPOINT - 422 ERROR DEBUG")
print("=" * 60)

# Try to signup (might fail if user exists, that's okay)
print("\n1. Attempting signup...")
try:
    signup_response = requests.post(f"{base_url}/api/auth/signup", json=signup_data)
    print(f"   Status: {signup_response.status_code}")
    if signup_response.status_code == 200:
        token = signup_response.json()["access_token"]
        print(f"   ✓ Signup successful, got token")
    else:
        print(f"   User might already exist, trying login...")
        # Try login instead
        login_response = requests.post(f"{base_url}/api/auth/login", json=signup_data)
        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            print(f"   ✓ Login successful, got token")
        else:
            print(f"   ✗ Login failed: {login_response.text}")
            token = None
except Exception as e:
    print(f"   ✗ Error: {e}")
    # Try login
    try:
        login_response = requests.post(f"{base_url}/api/auth/login", json=signup_data)
        token = login_response.json()["access_token"]
        print(f"   ✓ Login successful after signup error")
    except:
        token = None

if not token:
    print("\n✗ Could not get authentication token. Exiting.")
    exit(1)

# Now test the strategy endpoint with the exact data from frontend
print("\n2. Testing /api/strategy endpoint...")
strategy_data = {
    "goal": "Sell coffee subscriptions on Instagram",
    "audience": "College students aged 18-24",
    "industry": "F&B (Food & Beverage)",
    "platform": "Instagram",
    "contentType": "Mixed Content",
    "experience": "beginner"
}

print(f"\n   Request payload:")
print(f"   {json.dumps(strategy_data, indent=4)}")

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

print(f"\n   Sending POST request to {base_url}/api/strategy...")
try:
    strategy_response = requests.post(
        f"{base_url}/api/strategy",
        json=strategy_data,
        headers=headers
    )
    
    print(f"\n   Status Code: {strategy_response.status_code}")
    print(f"\n   Response Headers:")
    for key, value in strategy_response.headers.items():
        print(f"     {key}: {value}")
    
    print(f"\n   Response Body:")
    try:
        response_json = strategy_response.json()
        print(json.dumps(response_json, indent=4))
    except:
        print(strategy_response.text)
    
    if strategy_response.status_code == 422:
        print("\n" + "=" * 60)
        print("422 VALIDATION ERROR DETAILS:")
        print("=" * 60)
        error_detail = strategy_response.json()
        if "detail" in error_detail:
            print(json.dumps(error_detail["detail"], indent=4))
    
except Exception as e:
    print(f"\n   ✗ Request failed: {e}")

print("\n" + "=" * 60)
