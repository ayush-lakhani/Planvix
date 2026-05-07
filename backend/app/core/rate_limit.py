from slowapi import Limiter
from slowapi.util import get_remote_address
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

# Initialize Limiter with Redis storage via storage_uri
# SlowAPI internally handles the Redis connection using the 'limits' library.
limiter = Limiter(
    key_func=get_user_rate_key,
    storage_uri=settings.REDIS_URL,
    default_limits=[get_tiered_limit]
)

logger.info(f"✅ SlowAPI initialized with storage: {settings.REDIS_URL}")
