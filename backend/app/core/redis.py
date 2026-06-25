import redis
from app.core.config import settings
import logging
import time
import threading
from app.core.redis_health import redis_health_manager

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
    Production-grade Redis Client wrapper composing RedisHealthManager
    and falling back to local InMemoryCache on failure.
    """
    def __init__(self):
        self.health_manager = redis_health_manager
        self.in_memory = InMemoryCache()

    @property
    def enabled(self) -> bool:
        return self.health_manager.is_redis_available()

    @property
    def client(self):
        return self.health_manager.redis_client

    def get(self, key: str):
        if self.health_manager.is_redis_available() and self.health_manager.redis_client:
            try:
                return self.health_manager.redis_client.get(key)
            except Exception as e:
                logger.warning(f"⚠️ Redis GET failed: {e}. Degrading to in-memory fallback.")
                self.health_manager.report_failure()
        return self.in_memory.get(key)

    def set(self, key: str, value: str, ex: int = None):
        if self.health_manager.is_redis_available() and self.health_manager.redis_client:
            try:
                return self.health_manager.redis_client.set(key, value, ex=ex)
            except Exception as e:
                logger.warning(f"⚠️ Redis SET failed: {e}. Degrading to in-memory fallback.")
                self.health_manager.report_failure()
        return self.in_memory.set(key, value, ex=ex)

    def delete(self, key: str):
        if self.health_manager.is_redis_available() and self.health_manager.redis_client:
            try:
                return bool(self.health_manager.redis_client.delete(key))
            except Exception as e:
                logger.warning(f"⚠️ Redis DELETE failed: {e}. Degrading to in-memory fallback.")
                self.health_manager.report_failure()
        return self.in_memory.delete(key)

    def incr(self, key: str):
        if self.health_manager.is_redis_available() and self.health_manager.redis_client:
            try:
                return self.health_manager.redis_client.incr(key)
            except Exception as e:
                logger.warning(f"⚠️ Redis INCR failed: {e}. Degrading to in-memory fallback.")
                self.health_manager.report_failure()
        return self.in_memory.incr(key)

    def ping(self) -> bool:
        return self.health_manager.is_redis_available()

# Singleton instance
redis_client = RedisCache()

