import asyncio
from motor.motor_async_env import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load settings
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
DB_NAME = "content_planner" # As defined in your config.py

async def rename_to_planvix():
    print(f"Connecting to database: {DB_NAME}...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    # List of collections to check
    collections = await db.list_collection_names()
    print(f"Found collections: {collections}")
    
    for collection_name in collections:
        print(f"Processing collection: {collection_name}...")
        coll = db[collection_name]
        
        # Example: Updating 'strategies' collection content
        if collection_name == "strategies":
            # Update 'Planvx' to 'planvIx'
            result = await coll.update_many(
                {"generated_content": {"$regex": "Planvx", "$options": "i"}},
                [{"$set": {"generated_content": {
                    "$replaceOne": {"input": "$generated_content", "find": "Planvx", "replacement": "planvIx"}
                }}}]
            )
            print(f"Updated {result.modified_count} 'Planvx' references in strategies.")
            
            # Update 'Stratify' to 'planvIx' (legacy)
            result_legacy = await coll.update_many(
                {"generated_content": {"$regex": "Stratify", "$options": "i"}},
                [{"$set": {"generated_content": {
                    "$replaceOne": {"input": "$generated_content", "find": "Stratify", "replacement": "planvIx"}
                }}}]
            )
            print(f"Updated {result_legacy.modified_count} 'Stratify' references in strategies.")

    print("Database update complete.")

if __name__ == "__main__":
    # Note: Requires 'motor' and 'dnspython' installed
    # pip install motor dnspython
    try:
        asyncio.run(rename_to_planvix())
    except Exception as e:
        print(f"Error during migration: {e}")
