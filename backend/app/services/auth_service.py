from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, status
from bson import ObjectId
from typing import Optional
import secrets
import hashlib
import httpx

from app.core.mongo import (
    db,
    users_collection, 
    refresh_tokens_collection, 
    strategies_collection, 
    ai_usage_logs_collection
)
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.core.redis import redis_client
from app.core.logger import logger

class AuthService:
    async def signup(self, user_data) -> dict:
        """
        Handles user registration logic.
        """
        if users_collection.find_one({"email": user_data.email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        hashed_password = get_password_hash(user_data.password)
        
        new_user = {
            "email": user_data.email,
            "password": hashed_password,
            "role": "client",
            "tier": "free",
            "created_at": datetime.now(timezone.utc)
        }
        
        result = users_collection.insert_one(new_user)
        user_id = str(result.inserted_id)
        
        access_token = create_access_token(
            data={"user_id": user_id, "sub": user_id, "role": "client", "tier": "free"}
        )
        refresh_token = await self.create_refresh_token(user_id)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": user_id,
            "email": user_data.email,
            "role": "client",
            "tier": "free"
        }

    async def login(self, user_data) -> dict:
        """
        Handles user login logic.
        """
        user = users_collection.find_one({"email": user_data.email})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        if user.get("auth_provider") == "google":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="This account uses Google Sign-In. Please sign in with Google.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        hashed_password = user.get("password")
        
        if not hashed_password or not verify_password(user_data.password, hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id = str(user["_id"])
        user_role = user.get("role", "client")
        user_tier = user.get("tier", "free")
        
        access_token = create_access_token(
            data={"user_id": user_id, "sub": user_id, "role": user_role, "tier": user_tier}
        )
        refresh_token = await self.create_refresh_token(user_id)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": user_id,
            "email": user["email"],
            "role": user_role,
            "tier": user_tier
        }

    async def create_refresh_token(self, user_id: str) -> str:
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        # Hash token for security in DB
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        refresh_tokens_collection.insert_one({
            "user_id": user_id,
            "token": token_hash,
            "expires_at": expires_at
        })
        return token

    async def refresh_access_token(self, refresh_token: str) -> dict:
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        db_token = refresh_tokens_collection.find_one({"token": token_hash})
        
        if not db_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
            
        if db_token["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            refresh_tokens_collection.delete_one({"token": token_hash})
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expired"
            )
            
        user_id = db_token["user_id"]
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
            
        user_role = user.get("role", "client")
        user_tier = user.get("tier", "free")
        
        new_access_token = create_access_token(
            data={"user_id": user_id, "sub": user_id, "role": user_role, "tier": user_tier}
        )
        
        # Optional: Rotate refresh token
        refresh_tokens_collection.delete_one({"token": token_hash})
        new_refresh_token = await self.create_refresh_token(user_id)
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "user_id": user_id,
            "email": user["email"],
            "role": user_role,
            "tier": user_tier,
        }

    async def delete_account(self, user_id: str) -> dict:
        """
        Permanently delete account and all associated data.
        Extreme logging enabled for root-cause diagnosis.
        """
        print(f"\n[DELETE_ACCOUNT] Starting deletion for user: {user_id}")
        logger.info(f"Initiating account deletion for user_id: {user_id}")
        
        if not ObjectId.is_valid(user_id):
            print(f"[DELETE_ACCOUNT] ERROR: Invalid user_id format: {user_id}")
            raise HTTPException(status_code=400, detail="Invalid user ID format")

        try:
            # 1. Delete strategies
            print(f"[DELETE_ACCOUNT] 1/6: Deleting strategies...")
            s_result = strategies_collection.delete_many({
                "$or": [{"user_id": user_id}, {"user_id": ObjectId(user_id)}]
            })
            print(f"[DELETE_ACCOUNT] -> Deleted {s_result.deleted_count} strategies")
            
            # 2. Delete usage logs
            print(f"[DELETE_ACCOUNT] 2/6: Deleting usage logs...")
            u_result = ai_usage_logs_collection.delete_many({
                "$or": [{"user_id": user_id}, {"user_id": ObjectId(user_id)}]
            })
            print(f"[DELETE_ACCOUNT] -> Deleted {u_result.deleted_count} usage logs")
            
            # 3. Delete refresh tokens
            print(f"[DELETE_ACCOUNT] 3/6: Deleting refresh tokens...")
            t_result = refresh_tokens_collection.delete_many({
                "$or": [{"user_id": user_id}, {"user_id": ObjectId(user_id)}]
            })
            print(f"[DELETE_ACCOUNT] -> Deleted {t_result.deleted_count} refresh tokens")

            # 4. Delete rate limits
            print(f"[DELETE_ACCOUNT] 4/6: Clearing rate limits...")
            try:
                rl_result = db.rate_limits.delete_many({
                    "$or": [{"user_id": user_id}, {"user_id": ObjectId(user_id)}]
                })
                print(f"[DELETE_ACCOUNT] -> Deleted {rl_result.deleted_count} rate limits")
            except Exception as e:
                print(f"[DELETE_ACCOUNT] -> Rate limit cleanup skipped: {e}")
            
            # 5. Clear Redis Cache
            print(f"[DELETE_ACCOUNT] 5/6: Clearing Redis cache...")
            try:
                cache_key = f"user:analytics:{user_id}"
                if redis_client.enabled and redis_client.client:
                    redis_client.client.delete(cache_key)
                    print(f"[DELETE_ACCOUNT] -> Redis cache key '{cache_key}' deleted")
                else:
                    print(f"[DELETE_ACCOUNT] -> Redis disabled, skipping")
            except Exception as e:
                print(f"[DELETE_ACCOUNT] -> Redis clearing error: {e}")

            # 6. Delete user record
            print(f"[DELETE_ACCOUNT] 6/6: Deleting user record...")
            result = users_collection.delete_one({"_id": ObjectId(user_id)})
            
            if result.deleted_count == 0:
                print(f"[DELETE_ACCOUNT] WARNING: User record not found in 'users' collection")
                # Don't fail if already gone, just log it
            else:
                print(f"[DELETE_ACCOUNT] -> User record deleted successfully")
            
            print(f"[DELETE_ACCOUNT] COMPLETE for {user_id}\n")
            return {"message": "Account and all data deleted successfully"}

        except HTTPException:
            raise
        except Exception as e:
            print(f"[DELETE_ACCOUNT] CRITICAL ERROR: {str(e)}")
            logger.error(f"Critical error during account deletion for {user_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Deletion failed: {str(e)}"
            )

        
    async def logout(self, token: str):
        if token:
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            refresh_tokens_collection.delete_one({"token": token_hash})

    async def google_auth(self, access_token: str) -> dict:
        """
        Verifies a Google access token via userinfo endpoint and creates/logs in the user.
        """
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google access token",
                )
            user_info = resp.json()

        email = user_info.get("email")
        name = user_info.get("name")
        picture = user_info.get("picture")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account must have an email.",
            )

        existing = users_collection.find_one({"email": email})
        if not existing:
            # Create new Google user
            new_user = {
                "email": email,
                "name": name,
                "picture": picture,
                "google_id": user_info.get("sub"),
                "role": "client",
                "tier": "free",
                "auth_provider": "google",
                "created_at": datetime.now(timezone.utc),
            }
            result = users_collection.insert_one(new_user)
            user_id = str(result.inserted_id)
            user_role = "client"
            user_tier = "free"
        else:
            user_id = str(existing["_id"])
            user_role = existing.get("role", "client")
            user_tier = existing.get("tier", "free")
            # Update info and metadata
            users_collection.update_one(
                {"_id": existing["_id"]},
                {
                    "$set": {
                        "name": name, 
                        "picture": picture, 
                        "last_login": datetime.now(timezone.utc),
                        "last_active": datetime.now(timezone.utc)
                    }
                }
            )

        access_token_jwt = create_access_token(
            data={"user_id": user_id, "sub": user_id, "role": user_role, "tier": user_tier}
        )
        refresh_token = await self.create_refresh_token(user_id)

        return {
            "access_token": access_token_jwt,
            "refresh_token": refresh_token,
            "user_id": user_id,
            "email": email,
            "name": name,
            "role": user_role,
            "tier": user_tier,
        }

auth_service = AuthService()
