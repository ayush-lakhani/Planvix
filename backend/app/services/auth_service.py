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
from app.core.logger import logger, log_event

class AuthService:
    """
    Enterprise Auth Service with brute-force protection and multi-provider support.
    """
    
    async def signup(self, user_data) -> dict:
        if await users_collection.find_one({"email": user_data.email}):
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
        
        result = await users_collection.insert_one(new_user)
        user_id = str(result.inserted_id)
        
        access_token = create_access_token(
            data={"user_id": user_id, "sub": user_id, "role": "client", "tier": "free"}
        )
        refresh_token = await self.create_refresh_token(user_id)
        
        log_event("user_signup", {"email": user_data.email, "user_id": user_id})
        
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
        Handles user login with brute-force protection.
        """
        # 1. Brute-force check
        await self._check_brute_force(user_data.email)

        user = await users_collection.find_one({"email": user_data.email})
        
        if not user:
            await self._record_login_failure(user_data.email)
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
            await self._record_login_failure(user_data.email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Success - clear failures
        await self._clear_login_failures(user_data.email)
        
        user_id = str(user["_id"])
        user_role = user.get("role", "client")
        user_tier = user.get("tier", "free")
        
        access_token = create_access_token(
            data={"user_id": user_id, "sub": user_id, "role": user_role, "tier": user_tier}
        )
        refresh_token = await self.create_refresh_token(user_id)
        
        log_event("user_login", {"email": user_data.email, "user_id": user_id})
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": user_id,
            "email": user["email"],
            "role": user_role,
            "tier": user_tier
        }

    # === Security Helpers ===

    async def _check_brute_force(self, email: str):
        if not redis_client.enabled: return
        try:
            key = f"auth:fail:{email}"
            count = redis_client.get(key)
            if count and int(count) >= 5:
                logger.warning(f"🚨 Brute-force protection triggered for {email}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many failed attempts. Please try again in 15 minutes."
                )
        except HTTPException: raise
        except Exception: pass

    async def _record_login_failure(self, email: str):
        if not redis_client.enabled: return
        try:
            key = f"auth:fail:{email}"
            count = redis_client.get(key)
            new_count = int(count) + 1 if count else 1
            redis_client.set(key, new_count, ex=900) # 15 min lockout
        except Exception: pass

    async def _clear_login_failures(self, email: str):
        if not redis_client.enabled: return
        try:
            redis_client.client.delete(f"auth:fail:{email}")
        except Exception: pass

    # === Token Management ===

    async def create_refresh_token(self, user_id: str) -> str:
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        await refresh_tokens_collection.insert_one({
            "user_id": user_id,
            "token": token_hash,
            "expires_at": expires_at
        })
        return token

    async def refresh_access_token(self, refresh_token: str) -> dict:
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        db_token = await refresh_tokens_collection.find_one({"token": token_hash})
        
        if not db_token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
            
        if db_token["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            await refresh_tokens_collection.delete_one({"token": token_hash})
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")
            
        user_id = db_token["user_id"]
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
            
        access_token = create_access_token(
            data={"user_id": user_id, "sub": user_id, "role": user.get("role", "client"), "tier": user.get("tier", "free")}
        )
        
        # Rotate refresh token
        await refresh_tokens_collection.delete_one({"token": token_hash})
        new_refresh_token = await self.create_refresh_token(user_id)
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "user_id": user_id,
            "email": user["email"],
            "role": user.get("role"),
            "tier": user.get("tier")
        }

    async def delete_account(self, user_id: str) -> dict:
        """
        Atomic account deletion.
        """
        logger.info(f"💣 Initiating hard deletion for user: {user_id}")
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID format")

        try:
            # Parallel deletion of associated data
            await asyncio.gather(
                strategies_collection.delete_many({"user_id": user_id}),
                ai_usage_logs_collection.delete_many({"user_id": user_id}),
                refresh_tokens_collection.delete_many({"user_id": user_id})
            )
            
            await users_collection.delete_one({"_id": ObjectId(user_id)})
            log_event("account_deleted", {"user_id": user_id})
            return {"message": "Account and all data deleted successfully"}
        except Exception as e:
            logger.error(f"Account deletion failed for {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error during deletion")

    async def logout(self, token: str):
        if token:
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            await refresh_tokens_collection.delete_one({"token": token_hash})

    async def google_auth(self, access_token: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google token")
            user_info = resp.json()

        email = user_info.get("email")
        if not email: raise HTTPException(status_code=400, detail="Google account lacks email")

        existing = await users_collection.find_one({"email": email})
        if not existing:
            new_user = {
                "email": email,
                "name": user_info.get("name"),
                "picture": user_info.get("picture"),
                "google_id": user_info.get("sub"),
                "role": "client",
                "tier": "free",
                "auth_provider": "google",
                "created_at": datetime.now(timezone.utc),
            }
            result = await users_collection.insert_one(new_user)
            user_id = str(result.inserted_id)
            user_role, user_tier = "client", "free"
        else:
            user_id = str(existing["_id"])
            user_role, user_tier = existing.get("role", "client"), existing.get("tier", "free")
            await users_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {"last_login": datetime.now(timezone.utc)}}
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
            "role": user_role,
            "tier": user_tier
        }

auth_service = AuthService()
