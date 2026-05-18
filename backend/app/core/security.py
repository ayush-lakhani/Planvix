import re
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from bson import ObjectId
import secrets
import hashlib

from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

security = HTTPBearer()

class PromptSanitizer:
    """
    Enterprise-grade utility to prevent Prompt Injection and System Leakage.
    """
    BLACKLIST_PATTERNS = [
        r"ignore previous instructions",
        r"ignore all instructions",
        r"system prompt",
        r"reveal your secrets",
        r"you are now an unfiltered",
        r"jailbreak",
        r"output your configuration",
        r"dan mode",
        r"operating system instructions"
    ]

    @classmethod
    def sanitize(cls, text: str) -> str:
        """Sanitize input and raise error if malicious patterns detected."""
        if not text:
            return ""
            
        text_lower = text.lower()
        for pattern in cls.BLACKLIST_PATTERNS:
            if re.search(pattern, text_lower):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Security violation: Malicious prompt pattern detected."
                )
        
        # Strip potentially dangerous characters but allow standard punctuation
        sanitized = re.sub(r'[<>{}[\]]', '', text)
        return sanitized.strip()

def hash_password(password: str) -> str:
    """Hash password using Argon2"""
    return pwd_context.hash(password)

get_password_hash = hash_password

def verify_password(password: str, hashed: str) -> bool:
    """Verify password - supports Argon2 and legacy SHA256"""
    # Legacy SHA256 verification
    def verify_password_sha256(password: str, hashed: str) -> bool:
        try:
            salt, pwd_hash = hashed.split('$')
            return hashlib.sha256((password + salt).encode()).hexdigest() == pwd_hash
        except:
            return False

    # Let passlib handle identification (Argon2, etc)
    try:
        return pwd_context.verify(password, hashed)
    except:
        # Fallback to legacy check if passlib fails (e.g. unknown hash format)
        return verify_password_sha256(password, hashed)

def create_access_token(data: dict, expires_hours: int = None) -> str:
    """
    Creates a signed JWT enforcing iat, iss, aud, and exp.
    """
    to_encode = data.copy()
    
    # Use timezone-aware datetime
    now = datetime.now(timezone.utc)
    
    # Expiry
    if expires_hours is not None:
        expire = now + timedelta(hours=expires_hours)
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({
        "exp": expire,
        "iat": now,
        "iss": settings.JWT_ISSUER,
        "aud": settings.JWT_AUDIENCE
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
