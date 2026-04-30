import requests
import json

base_url = "http://localhost:8000"

# Simple test - just check what validation error we get
strategy_data = {
    "goal": "Sell coffee subscriptions on Instagram",
    "audience": "College students aged 18-24",
    "industry": "F&B (Food & Beverage)",
    "platform": "Instagram",
    "contentType": "Mixed Content",
    "experience": "beginner"
}

print("Testing /api/strategy without auth to see validation error...")
print(f"Payload: {json.dumps(strategy_data, indent=2)}")

response = requests.post(f"{base_url}/api/strategy", json=strategy_data)
print(f"\nStatus: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
