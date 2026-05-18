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

# Initialize Limiter
limiter = Limiter(
    key_func=get_user_rate_key,
    storage_uri=settings.REDIS_URL,
    default_limits=[get_general_limit]
)

logger.info(f"✅ Enterprise Rate Limiter initialized with Redis: {settings.REDIS_URL}")
