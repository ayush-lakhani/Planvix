import requests
import json

base_url = "http://localhost:8000"

# Step 1: Login to get a token
print("Step 1: Logging in to get auth token...")
login_data = {
    "email": "test@example.com",
    "password": "testpassword123"
}

try:
    # Try login first
    login_response = requests.post(f"{base_url}/api/auth/login", json=login_data)
    
    if login_response.status_code == 401:
        # User doesn't exist, try signup
        print("  User doesn't exist, creating account...")
        signup_response = requests.post(f"{base_url}/api/auth/signup", json=login_data)
        if signup_response.status_code == 200:
            token = signup_response.json()["access_token"]
            print(f"  ✓ Account created and logged in")
        else:
            print(f"  ✗ Signup failed: {signup_response.json()}")
            exit(1)
    elif login_response.status_code == 200:
        token = login_response.json()["access_token"]
        print(f"  ✓ Logged in successfully")
    else:
        print(f"  ✗ Login failed: {login_response.json()}")
        exit(1)
        
except Exception as e:
    print(f"  ✗ Error: {e}")
    exit(1)

# Step 2: Test strategy endpoint WITH authentication
print("\nStep 2: Testing /api/strategy endpoint WITH authentication...")
strategy_data = {
    "goal": "Sell coffee subscriptions on Instagram",
    "audience": "College students aged 18-24",
    "industry": "F&B (Food & Beverage)",
    "platform": "Instagram",
    "contentType": "Mixed Content",
    "experience": "beginner"
}

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

print(f"  Request payload:")
for key, value in strategy_data.items():
    print(f"    {key}: \"{value}\"")

try:
    response = requests.post(f"{base_url}/api/strategy", json=strategy_data, headers=headers)
    
    print(f"\n  HTTP Status: {response.status_code}")
    
    if response.status_code == 422:
        print("\n  ⚠️  422 VALIDATION ERROR DETECTED!")
        print("  " + "="*70)
        error_data = response.json()
        if "detail" in error_data:
            if isinstance(error_data["detail"], list):
                for error in error_data["detail"]:
                    print(f"\n  Field: {' -> '.join(str(x) for x in error.get('loc', []))}")
                    print(f"  Message: {error.get('msg', 'N/A')}")
                    print(f"  Type: {error.get('type', 'N/A')}")
                    if 'input' in error:
                        print(f"  Input: {error['input']}")
            else:
                print(f"  Detail: {error_data['detail']}")
        print("  " + "="*70)
    elif response.status_code == 200:
        print("\n  ✓ SUCCESS! Strategy generated")
        result = response.json()
        print(f"  Strategy ID: {result.get('strategy', {}).get('_id', 'N/A')}")
    else:
        print(f"\n  Response: {response.json()}")
        
except Exception as e:
    print(f"\n  ✗ Error: {e}")

print("\n" + "="*80)
