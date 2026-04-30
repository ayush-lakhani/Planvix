from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client.content_planner

# Get all strategies
strategies = list(db.strategies.find({}, {'_id': 1, 'industry': 1, 'platform': 1, 'user_id': 1}))

print(f'Total strategies in database: {len(strategies)}')
print('\nStrategy details:')
for i, s in enumerate(strategies, 1):
    print(f"{i}. ID: {s['_id']}")
    print(f"   Industry: {s.get('industry', 'N/A')}")
    print(f"   Platform: {s.get('platform', 'N/A')}")
    print(f"   User ID: {s.get('user_id', 'N/A')}")
    print()
