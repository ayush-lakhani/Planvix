from datetime import datetime, timezone
from fastapi import HTTPException, status
from bson import ObjectId
from typing import Optional

from app.core.mongo import users_collection, refresh_tokens_collection
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
import secrets
import hashlib
from datetime import timedelta

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
        
        current_month = datetime.now(timezone.utc).strftime("%Y-%m")
        user_doc = {
            "email": user_data.email,
            "hashed_password": get_password_hash(user_data.password),
            "role": "client",  # Default role
            "tier": "free",
            "usage_count": 0,
            "usage_month": current_month,
            "created_at": datetime.now(timezone.utc)
        }
        
        result = users_collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Token creation with role claim and user_id mapped to what dependency looks for
        access_token = create_access_token(data={"user_id": user_id, "sub": user_id, "role": "client"})
        refresh_token = await self.create_refresh_token(user_id)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": user_id,
            "email": user_data.email,
            "role": "client"
        }

    async def login(self, user_data) -> dict:
        """
        Handles user login and JWT issuance.
        """
        user = users_collection.find_one({"email": user_data.email})
        if not user or not verify_password(user_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        user_id = str(user["_id"])
        user_role = user.get("role", "client")
        
        # Token creation with role claim and user_id mapped to what dependency looks for
        access_token = create_access_token(data={"user_id": user_id, "sub": user_id, "role": user_role})
        refresh_token = await self.create_refresh_token(user_id)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": user_id,
            "email": user_data.email,
            "role": user_role
        }

    async def create_refresh_token(self, user_id: str) -> str:
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        expire_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        refresh_tokens_collection.insert_one({
            "token": token_hash,
            "user_id": user_id,
            "expires_at": expire_at,
            "created_at": datetime.utcnow()
        })
        return token
        
    async def refresh_access_token(self, token: str) -> dict:
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        db_token = refresh_tokens_collection.find_one({"token": token_hash})
        if not db_token or db_token["expires_at"] < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
            
        user_id = db_token["user_id"]
        
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
            
        user_role = user.get("role", "client")
        
        refresh_tokens_collection.delete_one({"_id": db_token["_id"]})
        
        new_refresh_token = await self.create_refresh_token(user_id)
        new_access_token = create_access_token(data={"user_id": user_id, "sub": user_id, "role": user_role})
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "user_id": user_id,
            "email": user["email"],
            "role": user_role
        }
        
    async def logout(self, token: str):
        if token:
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            refresh_tokens_collection.delete_one({"token": token_hash})

auth_service = AuthService()
