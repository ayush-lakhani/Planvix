"""
Intercept the actual 422 error response to see validation details
"""
import requests
import json

base_url = "http://localhost:8000"

# Create test account
import random
email = f"test{random.randint(100000,999999)}@test.com"
password = "password123"

print("Creating test account...")
signup = requests.post(f"{base_url}/api/auth/signup", json={"email": email, "password": password})

if signup.status_code != 200:
    print(f"Signup failed: {signup.status_code}")
    print(signup.json())
    exit(1)

token = signup.json()["access_token"]
print(f"✓ Account created: {email}")

# Test with MINIMAL valid data first
print("\n" + "="*80)
print("TEST 1: Minimal valid data")
print("="*80)

minimal_data = {
    "goal": "test goal here minimum ten chars",
    "audience": "test audience",
    "industry": "Technology",
    "platform": "Instagram"
}

response = requests.post(
    f"{base_url}/api/strategy",
    json=minimal_data,
    headers={"Authorization": f"Bearer {token}"}
)

print(f"Status: {response.status_code}")
if response.status_code == 422:
    print("422 ERROR:")
    print(json.dumps(response.json(), indent=2))
elif response.status_code == 200:
    print("✓ SUCCESS with minimal data")

# Test with contentType (camelCase)
print("\n" + "="*80)
print("TEST 2: With contentType (camelCase)")
print("="*80)

data_with_contentType = {
    "goal": "test goal here minimum ten chars",
    "audience": "test audience",
    "industry": "Technology",
    "platform": "Instagram",
    "contentType": "Stories"
}

response = requests.post(
    f"{base_url}/api/strategy",
    json=data_with_contentType,
    headers={"Authorization": f"Bearer {token}"}
)

print(f"Status: {response.status_code}")
if response.status_code == 422:
    print("422 ERROR:")
    error_data = response.json()
    print(json.dumps(error_data, indent=2))
    
    if "detail" in error_data and isinstance(error_data["detail"], list):
        print("\nSPECIFIC ERRORS:")
        for e in error_data["detail"]:
            field = " -> ".join(str(x) for x in e.get("loc", []))
            print(f"  • Field: {field}")
            print(f"    Error: {e.get('msg', 'N/A')}")
            print(f"    Type: {e.get('type', 'N/A')}")
elif response.status_code == 200:
    print("✓ SUCCESS with contentType")

# Test with content_type (snake_case)
print("\n" + "="*80)
print("TEST 3: With content_type (snake_case)")
print("="*80)

data_with_content_type = {
    "goal": "test goal here minimum ten chars",
    "audience": "test audience",
    "industry": "Technology",
    "platform": "Instagram",
    "content_type": "Stories"
}

response = requests.post(
    f"{base_url}/api/strategy",
    json=data_with_content_type,
    headers={"Authorization": f"Bearer {token}"}
)

print(f"Status: {response.status_code}")
if response.status_code == 422:
    print("422 ERROR:")
    print(json.dumps(response.json(), indent=2))
elif response.status_code == 200:
    print("✓ SUCCESS with content_type")

print("\n" + "="*80)
print("CONCLUSION:")
print("="*80)
print("Check which test passed to see the correct field name!")
