import time
import logging
import threading
import redis
from app.core.config import settings

logger = logging.getLogger("app.core.redis_health")

class RedisHealthManager:
    """
    Production-grade Redis Health Manager implementing:
    - Continuous health monitoring
    - Circuit breaker to prevent connection spamming
    - Reconnection with exponential backoff (2^failures up to max 60s)
    - Automatic switch back to Redis once connection is restored
    """
    def __init__(self):
        self.redis_url = getattr(settings, "REDIS_URL", "")
        self.status = "degraded"  # "connected" | "degraded" | "reconnecting"
        self.redis_client = None
        self.failure_count = 0
        self.last_attempt_time = 0
        self.backoff_delay = 1.0  # Start with 1.0s backoff
        self.max_backoff = 60.0   # Cap at 60s backoff
        self.lock = threading.Lock()
        self.connect()

    def connect(self) -> bool:
        """
        Performs the actual socket ping and sets state/circuit breaker options.
        """
        with self.lock:
            self.last_attempt_time = time.time()
            if not self.redis_url or not (self.redis_url.startswith("redis://") or self.redis_url.startswith("rediss://")):
                self.status = "degraded"
                self.redis_client = None
                return False

            try:
                # Short timeout to prevent locking request threads
                client = redis.from_url(
                    self.redis_url,
                    decode_responses=True,
                    socket_timeout=2,
                    socket_connect_timeout=2
                )
                client.ping()
                
                # Check for recovery transition
                if self.status != "connected":
                    logger.info("🔄 RedisHealthManager: Redis recovered.")
                    logger.info("🔄 RedisHealthManager: Switched back to Redis.")
                
                self.redis_client = client
                self.status = "connected"
                self.failure_count = 0
                self.backoff_delay = 1.0
                return True
            except Exception as e:
                self.failure_count += 1
                # Exponential backoff: 2^(failures-1)
                self.backoff_delay = min(self.max_backoff, 1.0 * (2 ** (self.failure_count - 1)))
                self.redis_client = None
                
                if self.status == "connected":
                    logger.error("🚨 RedisHealthManager: Redis disconnected.")
                    logger.warning("⚠️ RedisHealthManager: Switched to memory fallback.")
                
                self.status = "reconnecting" if self.failure_count > 1 else "degraded"
                logger.warning(f"⚠️ RedisHealthManager: Connection failed: {e}. Backoff active for {self.backoff_delay:.1f}s.")
                return False

    def check_reconnect(self) -> bool:
        """
        Checks if backoff window has expired, and if so, performs reconnect check.
        """
        if self.status == "connected":
            return True

        now = time.time()
        # Circuit breaker: only attempt reconnect if backoff delay has passed
        if now - self.last_attempt_time > self.backoff_delay:
            self.last_attempt_time = now
            return self.connect()
            
        return False

    def is_redis_available(self) -> bool:
        """
        Verifies if Redis is available. Safely triggers lazy reconnects.
        """
        if self.status == "connected" and self.redis_client:
            return True
        self.check_reconnect()
        return self.status == "connected"

    def report_failure(self):
        """
        Reports an operational failure. Instantly trips circuit breaker to memory fallback.
        """
        with self.lock:
            if self.status == "connected":
                logger.error("🚨 RedisHealthManager: Redis operation failure detected.")
                logger.warning("⚠️ RedisHealthManager: Switched to memory fallback.")
                self.status = "degraded"
                self.redis_client = None
                self.last_attempt_time = time.time()
                self.failure_count = 1
                self.backoff_delay = 1.0

# Shared global health manager singleton
redis_health_manager = RedisHealthManager()
