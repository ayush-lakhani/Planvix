import requests
import json
import sys

base_url = "http://localhost:8000"

# Test data matching frontend exactly
strategy_data = {
    "goal": "Sell coffee subscriptions on Instagram",
    "audience": "College students aged 18-24",
    "industry": "F&B (Food & Beverage)",
    "platform": "Instagram",
    "contentType": "Mixed Content",
    "experience": "beginner"
}

print("="*80)
print("DEBUGGING 422 ERROR - /api/strategy endpoint")
print("="*80)
print(f"\nRequest URL: {base_url}/api/strategy")
print(f"\nRequest Body:")
for key, value in strategy_data.items():
    print(f"  {key}: \"{value}\" (length: {len(value)})")

print(f"\n\nSending request...")
try:
    response = requests.post(f"{base_url}/api/strategy", json=strategy_data, timeout=5)
    
    print(f"\nHTTP Status: {response.status_code}")
    print(f"\nResponse Body:")
    print("-"*80)
    
    try:
        json_response = response.json()
        print(json.dumps(json_response, indent=2))
        
        if response.status_code == 422 and "detail" in json_response:
            print("\n" + "="*80)
            print("VALIDATION ERROR DETAILS:")
            print("="*80)
            for error in json_response["detail"]:
                print(f"\nField: {error.get('loc', 'unknown')}")
                print(f"Error: {error.get('msg', 'unknown')}")
                print(f"Type: {error.get('type', 'unknown')}")
    except:
        print(response.text)
    
except requests.exceptions.Timeout:
    print("ERROR: Request timed out")
except requests.exceptions.ConnectionError:
    print("ERROR: Could not connect to backend. Is it running on port 8000?")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")

print("\n" + "="*80)
