import os
from pymongo import MongoClient, ASCENDING, DESCENDING
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# MongoDB Setup
print("DEBUG: Connecting to MongoDB...")

if not MONGO_URI:
    print("DEBUG: MONGO_URI is missing, reverting to fallback")

mongo_client = MongoClient(MONGO_URI)
try:
    mongo_client.admin.command('ping')
    print("DEBUG: MongoDB initialized and connected.")
except Exception as e:
    print(f"DEBUG: MongoDB connection failed: {e}")

db = mongo_client["content_planner"]
users_collection = db.users
strategies_collection = db.strategies
ai_usage_logs_collection = db.ai_usage_logs
refresh_tokens_collection = db.refresh_tokens

# Create indexes
try:
    users_collection.create_index("email", unique=True)
    users_collection.create_index([("created_at", DESCENDING)])

    strategies_collection.create_index("user_id")
    strategies_collection.create_index("cache_key")
    strategies_collection.create_index([("created_at", DESCENDING)])
    strategies_collection.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])

    ai_usage_logs_collection.create_index("user_id")
    ai_usage_logs_collection.create_index([("created_at", DESCENDING)])
    ai_usage_logs_collection.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])

    refresh_tokens_collection.create_index("user_id")
    refresh_tokens_collection.create_index("token", unique=True)
    refresh_tokens_collection.create_index("expires_at", expireAfterSeconds=0)

    print("DEBUG: MongoDB indexes verified.")
except Exception as e:
    print(f"DEBUG: Failed to create indexes: {e}")


# Redis logic moved to app.core.cache
