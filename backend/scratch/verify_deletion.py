import sys
import os

# Robust path injection
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.core.mongo import db
    from app.core.redis import redis_client
    from bson import ObjectId
    print("✅ Imports successful.")
except ImportError as e:
    print(f"❌ Import failed: {e}")
    print(f"Current sys.path: {sys.path}")
    sys.exit(1)

def verify_user_deleted(user_id_str):
    print(f"\n--- Verifying Deletion for UID: {user_id_str} ---")
    
    # Collections to audit
    audit_map = {
        "users": {"_id": ObjectId(user_id_str) if ObjectId.is_valid(user_id_str) else user_id_str},
        "strategies": {"user_id": user_id_str},
        "ai_usage_logs": {"user_id": user_id_str},
        "refresh_tokens": {"user_id": user_id_str},
        "rate_limits": {"user_id": user_id_str}
    }
    
    all_clean = True
    for coll_name, query in audit_map.items():
        try:
            count = db[coll_name].count_documents(query)
            if count > 0:
                print(f"[FAIL] {coll_name:15} | Found {count} documents")
                all_clean = False
            else:
                print(f"[PASS] {coll_name:15} | Clean")
        except Exception as e:
            print(f"[ERR ] {coll_name:15} | Query failed: {e}")
            all_clean = False

    # Redis Check
    cache_key = f"user:analytics:{user_id_str}"
    try:
        if redis_client.enabled:
            exists = redis_client.client.exists(cache_key)
            if exists:
                print(f"[FAIL] Redis Cache    | Key '{cache_key}' still exists")
                all_clean = False
            else:
                print(f"[PASS] Redis Cache    | Key removed")
        else:
            print(f"[SKIP] Redis Cache    | Redis is disabled")
    except Exception as e:
        print(f"[ERR ] Redis Cache    | Check failed: {e}")

    if all_clean:
        print("\n✨ CONCLUSION: All data for this user has been successfully wiped.")
    else:
        print("\n⚠️ CONCLUSION: Some data still persists. Check logs above.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("\nUsage: python verify_deletion.py <user_id>")
        print("Example: python verify_deletion.py 65f1a2b3c4d5e6f7a8b9c0d1")
    else:
        verify_user_deleted(sys.argv[1])
