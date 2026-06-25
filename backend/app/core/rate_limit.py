from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request
from app.core.config import settings
from app.core.logger import logger, user_tier_var

def get_user_rate_key(request: Request) -> str:
    """
    Enterprise rate key: User ID if authenticated, else Client IP.
    """
    user_id = getattr(request.state, "user_id", None)
    if user_id and user_id != "anonymous":
        return f"user:{user_id}"
    return get_remote_address(request)

def get_general_limit() -> str:
    """
    General API limits based on tier.
    """
    try:
        tier = user_tier_var.get()
    except LookupError:
        tier = "free"
        
    if tier == "pro":
        return "60/minute"
    return "20/minute"

def get_ai_limit(request: Request) -> str:
    """
    Strict AI generation limits to prevent provider abuse.
    """
    tier = getattr(request.state, "user_tier", "free")
    if tier == "pro":
        return "10/minute"
    return "2/minute"

def get_auth_limit(request: Request) -> str:
    """
    Strict auth limits to prevent brute-force attacks.
    """
    return "5/minute"

import redis

# Determine storage URI and validate Redis configuration at startup
storage_uri = getattr(settings, "REDIS_URL", "")
redis_ok = False

if storage_uri and (storage_uri.startswith("redis://") or storage_uri.startswith("rediss://")):
    try:
        # Parse for safe log formatting
        safe_url = storage_uri.split("@")[-1] if "@" in storage_uri else storage_uri
        logger.info(f"Rate Limiter: Testing Redis connection to {safe_url}...")
        
        test_client = redis.from_url(
            storage_uri,
            socket_timeout=2,
            socket_connect_timeout=2
        )
        test_client.ping()
        redis_ok = True
        logger.info("✅ Rate Limiter Redis connection test successful.")
    except Exception as e:
        logger.warning(f"⚠️ Rate Limiter Redis connection test failed: {e}")
        logger.warning("   -> Degrading rate limiter to local in-memory storage (memory://).")
        storage_uri = "memory://"
else:
    logger.warning("⚠️ No valid REDIS_URL configured for rate limiting. Using memory://")
    storage_uri = "memory://"

# Initialize Limiter with robust runtime fallback and error swallowing
limiter = Limiter(
    key_func=get_user_rate_key,
    storage_uri=storage_uri,
    default_limits=[get_general_limit],
    in_memory_fallback_enabled=True,
    swallow_errors=True
)

if redis_ok:
    logger.info("✅ Enterprise Rate Limiter initialized with Redis storage.")
else:
    logger.info("✅ Enterprise Rate Limiter initialized with local In-Memory storage.")

