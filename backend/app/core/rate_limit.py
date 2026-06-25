from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request
from app.core.config import settings
from app.core.logger import logger, user_tier_var

def get_client_ip(request: Request) -> str:
    """
    Extracts the client IP address from request headers, supporting trusted proxies.
    Checks:
    1. CF-Connecting-IP (Cloudflare)
    2. X-Forwarded-For (gets first element)
    3. X-Real-IP
    4. request.client.host (fallback)
    """
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip.strip()
        
    xff = request.headers.get("x-forwarded-for")
    if xff:
        parts = xff.split(",")
        if parts:
            return parts[0].strip()
            
    xri = request.headers.get("x-real-ip")
    if xri:
        return xri.strip()
        
    if request.client:
        return request.client.host
        
    return "127.0.0.1"

def get_user_rate_key(request: Request) -> str:
    """
    Enterprise rate key: API Key first, then User ID, then Client IP.
    """
    api_key = request.headers.get("x-api-key") or request.headers.get("X-API-Key")
    if api_key:
        return f"apikey:{api_key}"
        
    user_id = getattr(request.state, "user_id", None)
    if user_id and user_id != "anonymous":
        return f"user:{user_id}"
        
    return f"ip:{get_client_ip(request)}"

def get_general_limit(request: Request = None) -> str:
    """
    General API limits based on API key, user tier, or IP.
    """
    if request is None:
        try:
            tier = user_tier_var.get()
        except LookupError:
            tier = "free"
        if tier == "pro":
            return getattr(settings, "RATE_LIMIT_USER_PRO", "100/minute")
        return getattr(settings, "RATE_LIMIT_USER_FREE", "30/minute")

    api_key = request.headers.get("x-api-key") or request.headers.get("X-API-Key")
    if api_key:
        return getattr(settings, "RATE_LIMIT_API_KEY", "200/minute")

    user_id = getattr(request.state, "user_id", None)
    if user_id and user_id != "anonymous":
        tier = getattr(request.state, "user_tier", "free")
        if tier == "pro":
            return getattr(settings, "RATE_LIMIT_USER_PRO", "100/minute")
        return getattr(settings, "RATE_LIMIT_USER_FREE", "30/minute")

    return getattr(settings, "RATE_LIMIT_IP", "30/minute")

def get_rate_limit_signup(request: Request = None) -> str:
    return getattr(settings, "RATE_LIMIT_SIGNUP", "5/minute")

def get_rate_limit_login(request: Request = None) -> str:
    return getattr(settings, "RATE_LIMIT_LOGIN", "5/minute")

def get_rate_limit_refresh(request: Request = None) -> str:
    return getattr(settings, "RATE_LIMIT_REFRESH", "10/minute")

def get_rate_limit_google(request: Request = None) -> str:
    return getattr(settings, "RATE_LIMIT_GOOGLE", "10/minute")

def get_rate_limit_ai(request: Request = None) -> str:
    return getattr(settings, "RATE_LIMIT_AI", "2/minute")


from limits.storage.base import Storage
from limits.storage.redis import RedisStorage
from limits.storage.memory import MemoryStorage
from limits.storage import SCHEMES
from app.core.redis_health import redis_health_manager

class FailoverRedisStorage(Storage):
    """
    Production-grade limits Storage composing primary RedisStorage
    and secondary MemoryStorage. Governed by redis_health_manager.
    """
    STORAGE_SCHEME = ["failover+redis", "failover+rediss"]

    def __init__(self, uri: str, wrap_exceptions: bool = False, **options):
        super().__init__(uri, wrap_exceptions=wrap_exceptions, **options)
        self.redis_uri = uri.replace("failover+", "")
        self.wrap_exceptions = wrap_exceptions
        self.options = options
        
        self.memory_storage = MemoryStorage(uri="memory://")
        self.redis_storage = None
        self.health_manager = redis_health_manager
        
        try:
            self.redis_storage = RedisStorage(self.redis_uri, wrap_exceptions=wrap_exceptions, **options)
        except Exception as e:
            logger.warning(f"FailoverRedisStorage: Failed to initialize RedisStorage: {e}")

    @property
    def base_exceptions(self):
        return (Exception,)

    def _call(self, method_name, *args, **kwargs):
        if self.health_manager.is_redis_available():
            try:
                if not self.redis_storage:
                    self.redis_storage = RedisStorage(self.redis_uri, wrap_exceptions=self.wrap_exceptions, **self.options)
                method = getattr(self.redis_storage, method_name)
                return method(*args, **kwargs)
            except Exception as e:
                logger.warning(f"⚠️ FailoverRedisStorage: Redis operation '{method_name}' failed: {e}. Degrading to Memory storage.")
                self.health_manager.report_failure()
                
        method = getattr(self.memory_storage, method_name)
        return method(*args, **kwargs)

    def incr(self, key: str, expiry: int, amount: int = 1) -> int:
        return self._call("incr", key, expiry, amount)

    def get(self, key: str) -> int:
        return self._call("get", key)

    def get_expiry(self, key: str) -> float:
        return self._call("get_expiry", key)

    def check(self) -> bool:
        return True

    def reset(self) -> int | None:
        return self._call("reset")

    def clear(self, key: str) -> None:
        return self._call("clear", key)

# Register scheme
SCHEMES["failover+redis"] = FailoverRedisStorage
SCHEMES["failover+rediss"] = FailoverRedisStorage

# Determine storage URI and validate Redis configuration at startup
storage_uri = getattr(settings, "REDIS_URL", "")

if storage_uri and storage_uri.startswith("redis://"):
    storage_uri = storage_uri.replace("redis://", "failover+redis://")
elif storage_uri.startswith("rediss://"):
    storage_uri = storage_uri.replace("rediss://", "failover+rediss://")
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

if storage_uri.startswith("failover"):
    logger.info("✅ Enterprise Rate Limiter initialized with Failover Redis/Memory storage.")
else:
    logger.info("✅ Enterprise Rate Limiter initialized with local In-Memory storage.")

