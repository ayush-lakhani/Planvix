import redis
from app.core.config import settings
import logging
import time
import threading

logger = logging.getLogger("app.core.cache")

class InMemoryCache:
    """
    Thread-safe in-memory key-value cache with TTL expiration.
    """
    def __init__(self):
        self.data = {}
        self.expires = {}
        self.lock = threading.Lock()

    def get(self, key: str):
        with self.lock:
            if key in self.data:
                if key in self.expires and self.expires[key] < time.time():
                    self.data.pop(key, None)
                    self.expires.pop(key, None)
                    return None
                return self.data[key]
            return None

    def set(self, key: str, value: str, ex: int = None):
        with self.lock:
            self.data[key] = str(value)
            if ex is not None:
                self.expires[key] = time.time() + ex
            else:
                self.expires.pop(key, None)
            return True

    def delete(self, key: str):
        with self.lock:
            existed = key in self.data
            self.data.pop(key, None)
            self.expires.pop(key, None)
            return existed

    def incr(self, key: str):
        with self.lock:
            val = self.get_unlocked(key)
            try:
                new_val = int(val) + 1 if val is not None else 1
            except (ValueError, TypeError):
                new_val = 1
            self.set_unlocked(key, str(new_val))
            return new_val

    # Helper methods without locking for internal use when lock is already acquired
    def get_unlocked(self, key: str):
        if key in self.data:
            if key in self.expires and self.expires[key] < time.time():
                self.data.pop(key, None)
                self.expires.pop(key, None)
                return None
            return self.data[key]
        return None

    def set_unlocked(self, key: str, value: str, ex: int = None):
        self.data[key] = str(value)
        if ex is not None:
            self.expires[key] = time.time() + ex
        else:
            self.expires.pop(key, None)
        return True


class RedisCache:
    """
    Production-grade Redis Client wrapper with automatic in-memory fallback
    and dynamic background reconnection (self-healing).
    """
    def __init__(self):
        self.client = None
        self.enabled = False
        self.in_memory = InMemoryCache()
        self.last_reconnect_time = 0
        self.connect()

    def connect(self):
        # Startup Validation
        redis_url = getattr(settings, "REDIS_URL", "")
        if not redis_url or not redis_url.strip() or not (redis_url.startswith("redis://") or redis_url.startswith("rediss://")):
            logger.warning("⚠️ Redis configuration invalid or missing. Starting with local in-memory fallback.")
            self.enabled = False
            self.client = None
            return

        try:
            logger.info("Connecting to Redis...")
            self.client = redis.from_url(
                redis_url,
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
            logger.warning("   -> Caching degraded. Falling back to local in-memory cache.")

    def check_reconnect(self):
        """
        Dynamically attempts to reconnect if the connection was degraded,
        limiting reconnection attempts to once every 30 seconds.
        """
        if not self.enabled:
            now = time.time()
            if now - self.last_reconnect_time > 30:
                self.last_reconnect_time = now
                logger.info("🔄 Attempting dynamic reconnection to Redis...")
                try:
                    # Attempt connection check
                    redis_url = getattr(settings, "REDIS_URL", "")
                    if redis_url and (redis_url.startswith("redis://") or redis_url.startswith("rediss://")):
                        temp_client = redis.from_url(
                            redis_url,
                            decode_responses=True,
                            socket_timeout=2,
                            socket_connect_timeout=2
                        )
                        temp_client.ping()
                        self.client = temp_client
                        self.enabled = True
                        logger.info("✅ Redis connection restored! Switching back to Redis cache.")
                except Exception as e:
                    logger.debug(f"Redis reconnection attempt failed: {e}")

    def get(self, key: str):
        self.check_reconnect()
        if self.enabled and self.client:
            try:
                return self.client.get(key)
            except Exception as e:
                logger.warning(f"⚠️ Redis GET failed: {e}. Degrading to in-memory fallback.")
                self.enabled = False
                self.client = None
                self.last_reconnect_time = time.time()
        return self.in_memory.get(key)

    def set(self, key: str, value: str, ex: int = None):
        self.check_reconnect()
        if self.enabled and self.client:
            try:
                return self.client.set(key, value, ex=ex)
            except Exception as e:
                logger.warning(f"⚠️ Redis SET failed: {e}. Degrading to in-memory fallback.")
                self.enabled = False
                self.client = None
                self.last_reconnect_time = time.time()
        return self.in_memory.set(key, value, ex=ex)

    def delete(self, key: str):
        self.check_reconnect()
        if self.enabled and self.client:
            try:
                return bool(self.client.delete(key))
            except Exception as e:
                logger.warning(f"⚠️ Redis DELETE failed: {e}. Degrading to in-memory fallback.")
                self.enabled = False
                self.client = None
                self.last_reconnect_time = time.time()
        return self.in_memory.delete(key)

    def incr(self, key: str):
        self.check_reconnect()
        if self.enabled and self.client:
            try:
                return self.client.incr(key)
            except Exception as e:
                logger.warning(f"⚠️ Redis INCR failed: {e}. Degrading to in-memory fallback.")
                self.enabled = False
                self.client = None
                self.last_reconnect_time = time.time()
        return self.in_memory.incr(key)

    def ping(self) -> bool:
        self.check_reconnect()
        if self.enabled and self.client:
            try:
                return bool(self.client.ping())
            except Exception:
                return False
        return True

# Singleton instance
redis_client = RedisCache()

