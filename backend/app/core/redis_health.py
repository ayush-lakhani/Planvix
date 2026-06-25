import time
import logging
import threading
import random
import redis
from app.core.config import settings

logger = logging.getLogger("app.core.redis_health")

class RedisHealthManager:
    """
    Production-grade Redis Health Manager implementing:
    - Canonical Circuit Breaker pattern (Closed, Open, Half-Open states)
    - Reconnection with exponential backoff and jitter (Full Jitter)
    - Configurable feature flags (FALLBACK_ENABLED, AUTO_RECOVERY)
    """
    def __init__(self):
        self.redis_url = getattr(settings, "REDIS_URL", "")
        self.status = "degraded"  # "connected" | "degraded" (Open) | "reconnecting" (Half-Open)
        self.redis_client = None
        self.failure_count = 0
        self.last_attempt_time = 0
        self.backoff_delay = 1.0  # Start with 1.0s backoff
        self.max_backoff = 60.0   # Cap at 60s backoff
        self.lock = threading.Lock()
        
        # Feature Flags from settings
        self.fallback_enabled = getattr(settings, "REDIS_FALLBACK_ENABLED", True)
        self.auto_recovery = getattr(settings, "REDIS_AUTO_RECOVERY", True)
        
        self.connect()

    def connect(self) -> bool:
        """
        Performs connection attempt. Transitions state to connected or degraded/reconnecting.
        """
        with self.lock:
            self.last_attempt_time = time.time()
            if not self.redis_url or not (self.redis_url.startswith("redis://") or self.redis_url.startswith("rediss://")):
                self.status = "degraded"
                self.redis_client = None
                return False

            try:
                # Obfuscate url password for log
                safe_url = self.redis_url.split("@")[-1] if "@" in self.redis_url else self.redis_url
                logger.info(f"RedisHealthManager: Trying connection to {safe_url}...")
                
                client = redis.from_url(
                    self.redis_url,
                    decode_responses=True,
                    socket_timeout=2,
                    socket_connect_timeout=2
                )
                client.ping()
                
                # Check for recovery transition
                if self.status != "connected":
                    logger.info("RedisHealthManager: Redis recovered.")
                    logger.info("RedisHealthManager: Switched back to Redis.")
                
                self.redis_client = client
                self.status = "connected"
                self.failure_count = 0
                self.backoff_delay = 1.0
                try:
                    from app.core.telemetry import REDIS_HEALTH_STATUS
                    REDIS_HEALTH_STATUS.set(1)
                except Exception:
                    pass
                return True
            except Exception as e:
                self.failure_count += 1
                
                # Exponential backoff with Jitter (Full Jitter)
                temp_delay = min(self.max_backoff, 1.0 * (2 ** (self.failure_count - 1)))
                self.backoff_delay = random.uniform(0.5 * temp_delay, temp_delay)
                self.redis_client = None
                
                if self.status == "connected":
                    logger.error(f"RedisHealthManager: Redis disconnected (Connection failed: {e}).")
                    logger.warning("RedisHealthManager: Switched to memory fallback.")
                
                self.status = "reconnecting" if self.failure_count > 1 else "degraded"
                logger.warning(f"RedisHealthManager: Connection attempt failed: {e}. Circuit Breaker: OPEN. Reconnect backoff: {self.backoff_delay:.1f}s.")
                
                try:
                    from app.core.telemetry import REDIS_HEALTH_STATUS
                    REDIS_HEALTH_STATUS.set(0)
                except Exception:
                    pass
                
                # If fallback is disabled, bubble up the exception
                if not self.fallback_enabled:
                    raise e
                    
                return False

    def check_reconnect(self) -> bool:
        """
        State machine transition: Half-Open check.
        If auto_recovery is disabled, reconnection will never be attempted.
        """
        if self.status == "connected":
            return True

        if not self.auto_recovery:
            return False

        now = time.time()
        # Only attempt to reconnect if circuit breaker has been open longer than backoff delay
        if now - self.last_attempt_time > self.backoff_delay:
            logger.info("RedisHealthManager: Circuit Breaker: HALF-OPEN. Running reconnection probe...")
            return self.connect()
            
        return False

    def is_redis_available(self) -> bool:
        """
        Checks health status. If degraded, checks if we can reconnect.
        """
        if self.status == "connected" and self.redis_client:
            return True
        self.check_reconnect()
        return self.status == "connected"

    def report_failure(self, error: Exception = None):
        """
        Reports an operational failure. Instantly trips the circuit breaker to OPEN state.
        """
        with self.lock:
            if self.status == "connected":
                logger.error(f"RedisHealthManager: Redis operation failure detected: {error}.")
                logger.warning("RedisHealthManager: Switched to memory fallback.")
                self.status = "degraded"
                self.redis_client = None
                self.last_attempt_time = time.time()
                self.failure_count = 1
                self.backoff_delay = 1.0
                try:
                    from app.core.telemetry import REDIS_HEALTH_STATUS
                    REDIS_HEALTH_STATUS.set(0)
                except Exception:
                    pass
                
            # If fallback is disabled, raise exception
            if not self.fallback_enabled and error:
                raise error

# Shared global health manager singleton
redis_health_manager = RedisHealthManager()
