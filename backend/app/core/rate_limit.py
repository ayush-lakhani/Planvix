from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.storage import RedisStorage
from fastapi import Request
from app.core.config import settings
from app.core.logger import logger

def get_user_rate_key(request: Request) -> str:
    """
    Custom key function that uses user_id if present, else falls back to IP.
    Ensures that rate limiting follows the user across devices/IPs.
    """
    user_id = getattr(request.state, "user_id", None)
    if user_id:
        return f"user:{user_id}"
    
    # Fallback to IP address
    return get_remote_address(request)

def get_tiered_limit(request: Request) -> str:
    """
    Dynamic limit string based on user tier.
    Free: 10/minute
    Pro: 20/minute
    """
    tier = getattr(request.state, "user_tier", "free")
    if tier == "pro":
        return "20/minute"
    return "10/minute"

# Initialize Redis Storage for SlowAPI
# This allows rate limits to be shared across multiple backend workers
try:
    storage = RedisStorage(settings.REDIS_URL)
    logger.info(f"✅ SlowAPI Redis Storage initialized: {settings.REDIS_URL}")
except Exception as e:
    logger.error(f"❌ Failed to initialize Redis storage for SlowAPI: {e}")
    # Fallback to default in-memory storage (not recommended for production)
    storage = None

limiter = Limiter(
    key_func=get_user_rate_key,
    storage=storage,
    default_limits=[get_tiered_limit] # Use dynamic tiered limits as default
)
