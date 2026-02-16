
from pymongo import MongoClient
from app.core.config import settings

# MongoDB Setup
print("DEBUG: Connecting to MongoDB...")
mongo_client = MongoClient(settings.MONGODB_URL)
try:
    mongo_client.admin.command('ping')
    print("DEBUG: MongoDB initialized and connected.")
except Exception as e:
    print(f"DEBUG: MongoDB connection failed: {e}")

db = mongo_client[settings.DB_NAME]
users_collection = db.users
strategies_collection = db.strategies

# Create indexes
try:
    users_collection.create_index("email", unique=True)
    strategies_collection.create_index("user_id")
    strategies_collection.create_index("cache_key")
    strategies_collection.create_index("created_at")
    strategies_collection.create_index([("user_id", 1), ("created_at", -1)])
    print("DEBUG: MongoDB indexes verified.")
except Exception as e:
    print(f"DEBUG: Failed to create indexes: {e}")


# Redis logic moved to app.core.cache
