"""
Complete diagnostic script to capture the exact 422 error
"""
import requests
import json

base_url = "http://localhost:8000"

print("="*80)
print("COMPLETE PROJECT DIAGNOSIS - 422 ERROR")
print("="*80)

# Step 1: Login
print("\n[STEP 1] Authenticating...")
login_data = {"email": "lakhaniayush@example.com", "password": "password"}

try:
    response = requests.post(f"{base_url}/api/auth/login", json=login_data)
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("✓ Authenticated as lakhaniayush@example.com")
    else:
        print("✗ Login failed, trying test account...")
        login_data = {"email": "test@example.com", "password": "testpassword123"}
        response = requests.post(f"{base_url}/api/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json()["access_token"]
            print("✓ Authenticated as test@example.com")
        else:
            # Create new account
            response = requests.post(f"{base_url}/api/auth/signup", json=login_data)
            token = response.json()["access_token"]
            print("✓ Created new account and authenticated")
except Exception as e:
    print(f"✗ Authentication failed: {e}")
    exit(1)

# Step 2: Test with exact data from screenshot
print("\n[STEP 2] Testing with data from screenshot...")
print("-"*80)

strategy_data = {
    "goal": "coffee selling",
    "audience": "collage student",
    "industry": "Coffee & Tea",
    "platform": "Instagram",
    "contentType": "Stories",
    "experience": "beginner"
}

print("Request Payload:")
print(json.dumps(strategy_data, indent=2))
print(f"\nField Validation:")
for key, value in strategy_data.items():
    print(f"  {key:15} = '{value}' (length: {len(value)})")

# Step 3: Send request
print(f"\n[STEP 3] Sending POST request to {base_url}/api/strategy...")
print("-"*80)

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

try:
    response = requests.post(
        f"{base_url}/api/strategy",
        json=strategy_data,
        headers=headers,
        timeout=10
    )
    
    print(f"\nHTTP Status: {response.status_code}")
    print(f"Response Headers:")
    print(f"  Content-Type: {response.headers.get('content-type')}")
    
    print(f"\n[STEP 4] Response Analysis:")
    print("-"*80)
    
    if response.status_code == 422:
        print("\n⚠️  422 VALIDATION ERROR DETECTED")
        print("="*80)
        
        error_data = response.json()
        print("\nFull Error Response:")
        print(json.dumps(error_data, indent=2))
        
        if "detail" in error_data:
            if isinstance(error_data["detail"], list):
                print("\n" + "="*80)
                print("VALIDATION ERRORS BREAKDOWN:")
                print("="*80)
                for i, error in enumerate(error_data["detail"], 1):
                    print(f"\nError #{i}:")
                    print(f"  Location: {' -> '.join(str(x) for x in error.get('loc', []))}")
                    print(f"  Message:  {error.get('msg', 'N/A')}")
                    print(f"  Type:     {error.get('type', 'N/A')}")
                    if 'input' in error:
                        print(f"  Input:    {error['input']}")
                    if 'ctx' in error:
                        print(f"  Context:  {error['ctx']}")
            else:
                print(f"\nError Detail: {error_data['detail']}")
                
    elif response.status_code == 200:
        print("\n✓ SUCCESS! Strategy generated")
        result = response.json()
        print(f"\nStrategy ID: {result.get('strategy', {}).get('_id', 'N/A')}")
        
    elif response.status_code == 429:
        print("\n⚠️  RATE LIMIT EXCEEDED")
        print(json.dumps(response.json(), indent=2))
        
    elif response.status_code == 403:
        print("\n⚠️  AUTHENTICATION ERROR")
        print(json.dumps(response.json(), indent=2))
        
    else:
        print(f"\n⚠️  UNEXPECTED STATUS CODE: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        
except requests.exceptions.Timeout:
    print("\n✗ Request timed out (backend might be slow or crashed)")
except requests.exceptions.ConnectionError:
    print("\n✗ Connection error - is the backend running on port 8000?")
except Exception as e:
    print(f"\n✗ Unexpected error: {type(e).__name__}: {e}")

print("\n" + "="*80)
print("DIAGNOSIS COMPLETE")
print("="*80)
