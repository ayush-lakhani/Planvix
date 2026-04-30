"""
Final diagnostic - test with exact screenshot data
"""
import requests
import json

base_url = "http://localhost:8000"

print("="*80)
print("FINAL DIAGNOSIS - EXACT SCREENSHOT DATA")
print("="*80)

# Create a fresh test account
import random
test_email = f"test{random.randint(1000,9999)}@example.com"
test_password = "password123"

print(f"\n[1] Creating test account: {test_email}")
signup_response = requests.post(
    f"{base_url}/api/auth/signup",
    json={"email": test_email, "password": test_password}
)

if signup_response.status_code == 200:
    token = signup_response.json()["access_token"]
    print(f"✓ Account created, token obtained")
else:
    print(f"✗ Signup failed: {signup_response.status_code}")
    print(signup_response.json())
    exit(1)

# Test with EXACT data from screenshot
print("\n[2] Testing with screenshot data...")
strategy_data = {
    "goal": "coffee selling",
    "audience": "collage student",
    "industry": "Coffee & Tea",
    "platform": "Instagram",
    "contentType": "Stories",
    "experience": "beginner"
}

print("\nRequest Data:")
for k, v in strategy_data.items():
    print(f"  {k:15} = '{v}'")

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

print(f"\n[3] POST {base_url}/api/strategy")
response = requests.post(
    f"{base_url}/api/strategy",
    json=strategy_data,
    headers=headers
)

print(f"\nStatus: {response.status_code}")

if response.status_code == 422:
    print("\n" + "="*80)
    print("422 VALIDATION ERROR - DETAILS:")
    print("="*80)
    error_data = response.json()
    print(json.dumps(error_data, indent=2))
    
    if "detail" in error_data and isinstance(error_data["detail"], list):
        print("\n" + "="*80)
        print("SPECIFIC VALIDATION ERRORS:")
        print("="*80)
        for i, err in enumerate(error_data["detail"], 1):
            print(f"\n[Error {i}]")
            print(f"  Field:   {' -> '.join(str(x) for x in err.get('loc', []))}")
            print(f"  Message: {err.get('msg', 'N/A')}")
            print(f"  Type:    {err.get('type', 'N/A')}")
            
elif response.status_code == 200:
    print("\n✓ SUCCESS! Strategy generated")
    result = response.json()
    print(f"  Strategy ID: {result.get('strategy', {}).get('_id', 'N/A')}")
else:
    print(f"\nUnexpected status: {response.status_code}")
    print(response.json())

print("\n" + "="*80)
