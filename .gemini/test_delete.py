import requests
from pymongo import MongoClient

# Get a strategy ID from database
client = MongoClient('mongodb://localhost:27017/')
db = client.content_planner
strategy = db.strategies.find_one({})

if strategy:
    strategy_id = str(strategy['_id'])
    print(f"Testing delete for strategy ID: {strategy_id}")
    print(f"Industry: {strategy.get('industry')}, Platform: {strategy.get('platform')}")
    
    # Get token (you'll need to replace this with actual token)
    token = input("Enter your auth token (from browser localStorage): ")
    
    # Test delete endpoint
    url = f"http://localhost:8000/api/history/{strategy_id}"
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"\nSending DELETE request to: {url}")
    response = requests.delete(url, headers=headers)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
else:
    print("No strategies found in database")
