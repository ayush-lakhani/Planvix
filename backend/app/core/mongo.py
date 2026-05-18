import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URL") or os.getenv("MONGO_URI") or "mongodb://localhost:27017/"

# MongoDB Async Setup
print("DEBUG: Connecting to MongoDB (Async)...")

mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client["content_planner"]

# Collections
users_collection = db.users
strategies_collection = db.strategies
ai_usage_logs_collection = db.ai_usage_logs
refresh_tokens_collection = db.refresh_tokens

async def init_db():
    """Verify connection and create indexes asynchronously."""
    try:
        await mongo_client.admin.command('ping')
        print("DEBUG: MongoDB initialized and connected.")
        
        # Create indexes
        await users_collection.create_index("email", unique=True)
        await users_collection.create_index([("created_at", DESCENDING)])

        await strategies_collection.create_index("user_id")
        await strategies_collection.create_index("cache_key")
        await strategies_collection.create_index([("created_at", DESCENDING)])
        await strategies_collection.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])

        await ai_usage_logs_collection.create_index("user_id")
        await ai_usage_logs_collection.create_index([("created_at", DESCENDING)])
        await ai_usage_logs_collection.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])

        await refresh_tokens_collection.create_index("user_id")
        await refresh_tokens_collection.create_index("token", unique=True)
        await refresh_tokens_collection.create_index("expires_at", expireAfterSeconds=0)

        print("DEBUG: MongoDB indexes verified.")
    except Exception as e:
        print(f"DEBUG: MongoDB initialization failed: {e}")



# Redis logic moved to app.core.cache
