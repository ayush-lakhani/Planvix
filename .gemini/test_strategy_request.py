import requests
import json

# Test the strategy endpoint
url = "http://localhost:8000/api/strategy"

# Get a token first (you'll need to login)
# For now, let's just test the validation

test_data = {
    "goal": "Sell coffee subscriptions on Instagram",
    "audience": "College students aged 18-24",
    "industry": "F&B (Food & Beverage)",
    "platform": "Instagram",
    "contentType": "Mixed Content",
    "experience": "beginner"
}

print("Testing strategy endpoint...")
print(f"Request data: {json.dumps(test_data, indent=2)}")

# This will fail without auth, but we can see the validation error
try:
    response = requests.post(url, json=test_data)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
