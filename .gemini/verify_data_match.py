"""
Check what the frontend is actually sending vs what backend expects
"""
import requests
import json

# Test 1: What backend expects (from main.py StrategyInput model)
print("="*80)
print("BACKEND EXPECTS (from main.py StrategyInput):")
print("="*80)
print("""
class StrategyInput(BaseModel):
    goal: str = Field(..., min_length=10, max_length=500)
    audience: str = Field(..., min_length=5, max_length=200)
    industry: str = Field(..., min_length=3, max_length=100)
    platform: str = Field(..., min_length=3, max_length=50)
    contentType: str = Field(default="Mixed Content", max_length=50)
    experience: str = Field(default="beginner", max_length=20)
""")

# Test 2: What frontend sends (from StrategyForm.jsx)
print("\n" + "="*80)
print("FRONTEND SENDS (from StrategyForm.jsx formData):")
print("="*80)
frontend_data = {
    "goal": "coffee selling",
    "audience": "collage student", 
    "industry": "Coffee & Tea",
    "platform": "Instagram",
    "contentType": "Stories",
    "experience": "beginner"
}
print(json.dumps(frontend_data, indent=2))

# Test 3: Try sending this to backend
print("\n" + "="*80)
print("TESTING: Sending frontend data to backend...")
print("="*80)

# Create test account
import random
email = f"test{random.randint(10000,99999)}@test.com"
signup = requests.post("http://localhost:8000/api/auth/signup", 
                       json={"email": email, "password": "password123"})

if signup.status_code == 200:
    token = signup.json()["access_token"]
    print(f"✓ Created account: {email}")
    
    # Send strategy request
    response = requests.post(
        "http://localhost:8000/api/strategy",
        json=frontend_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"\nResponse Status: {response.status_code}")
    
    if response.status_code == 422:
        print("\n❌ 422 VALIDATION ERROR:")
        print(json.dumps(response.json(), indent=2))
    elif response.status_code == 200:
        print("\n✅ SUCCESS!")
        print(f"Strategy ID: {response.json().get('strategy', {}).get('_id')}")
    else:
        print(f"\nUnexpected: {response.json()}")
else:
    print(f"❌ Signup failed: {signup.json()}")

print("\n" + "="*80)
