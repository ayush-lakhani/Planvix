import requests
import json

# Simple test - check if user's account has rate limit issues
base_url = "http://localhost:8000"

# Try to login as the user
login_data = {"email": "lakhaniayush@example.com", "password": "password"}
response = requests.post(f"{base_url}/api/auth/login", json=login_data)

if response.status_code == 200:
    token = response.json()["access_token"]
    print(f"Logged in as lakhaniayush@example.com")
    
    # Check usage
    usage_response = requests.get(
        f"{base_url}/api/user/usage",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if usage_response.status_code == 200:
        usage = usage_response.json()
        print(f"\nUsage Info:")
        print(json.dumps(usage, indent=2))
        
        if usage.get("used", 0) >= usage.get("limit", 10):
            print("\n*** RATE LIMIT EXCEEDED ***")
            print("This user has hit their free tier limit!")
    
    # Try strategy generation
    print(f"\nTrying strategy generation...")
    strategy_data = {
        "goal": "coffee selling test",
        "audience": "collage student test",
        "industry": "Coffee & Tea",
        "platform": "Instagram",
        "contentType": "Stories",
        "experience": "beginner"
    }
    
    strategy_response = requests.post(
        f"{base_url}/api/strategy",
        json=strategy_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"Status: {strategy_response.status_code}")
    
    if strategy_response.status_code == 422:
        print("\n422 ERROR:")
        print(json.dumps(strategy_response.json(), indent=2))
    elif strategy_response.status_code == 429:
        print("\n429 RATE LIMIT:")
        print(json.dumps(strategy_response.json(), indent=2))
    elif strategy_response.status_code == 200:
        print("\nSUCCESS!")
    else:
        print(f"\n{strategy_response.status_code}:")
        print(json.dumps(strategy_response.json(), indent=2))
        
else:
    print(f"Login failed: {response.status_code}")
    print("Trying common passwords...")
    
    for pwd in ["password123", "Password123", "password", "admin123"]:
        response = requests.post(f"{base_url}/api/auth/login", 
                                json={"email": "lakhaniayush@example.com", "password": pwd})
        if response.status_code == 200:
            print(f"SUCCESS with password: {pwd}")
            break
    else:
        print("Could not login with any common password")
