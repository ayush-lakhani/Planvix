import redis
from app.core.config import settings
import logging

logger = logging.getLogger("app.core.cache")

class RedisCache:
    def __init__(self):
        self.client = None
        self.enabled = False
        self.connect()

    def connect(self):
        try:
            logger.info("Connecting to Redis...")
            self.client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_timeout=2,
                socket_connect_timeout=2
            )
            self.client.ping()
            self.enabled = True
            logger.info("✅ Redis connected successfully.")
        except Exception as e:
            self.enabled = False
            self.client = None
            logger.warning(f"⚠️ Redis connection failed: {e}")
            logger.warning("   -> Caching disabled. Application will run in synchronous mode.")

    def get(self, key: str):
        if not self.enabled: return None
        try:
            return self.client.get(key)
        except Exception:
            return None

    def set(self, key: str, value: str, ex: int = None):
        if not self.enabled: return False
        try:
            return self.client.set(key, value, ex=ex)
        except Exception:
            return False

    def ping(self):
        if not self.enabled: return False
        return self.client.ping()

# Singleton instance
redis_client = RedisCache()
