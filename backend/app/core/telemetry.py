import time
import logging
from fastapi import Request, Response
from prometheus_client import Counter, Histogram, Gauge

logger = logging.getLogger("app.core.telemetry")

# --- Prometheus Metrics Definitions ---

HTTP_REQUEST_COUNT = Counter(
    "planvix_http_requests_total",
    "Total number of HTTP requests processed",
    ["method", "endpoint", "status"]
)

HTTP_REQUEST_DURATION = Histogram(
    "planvix_http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "endpoint"]
)

RATE_LIMIT_HIT_COUNT = Counter(
    "planvix_rate_limit_hits_total",
    "Total number of rate limit exceedances",
    ["endpoint", "user_id", "client_ip"]
)

REDIS_HEALTH_STATUS = Gauge(
    "planvix_redis_health",
    "Redis connection status (1 = connected, 0 = degraded/reconnecting)"
)

AUTH_EVENT_COUNT = Counter(
    "planvix_auth_events_total",
    "Total number of authentication signup/login/google events",
    ["event", "status", "reason"]
)


# --- OpenTelemetry Tracing Support ---
try:
    from opentelemetry import trace
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import SimpleSpanProcessor, ConsoleSpanExporter

    # Initialize a global tracer provider if not already set
    if not isinstance(trace.get_tracer_provider(), TracerProvider):
        provider = TracerProvider()
        # Default ConsoleSpanExporter prints traces to stdout for distributed debugging representation
        processor = SimpleSpanProcessor(ConsoleSpanExporter())
        provider.add_span_processor(processor)
        trace.set_tracer_provider(provider)

    tracer = trace.get_tracer("planvix-backend")
    otel_enabled = True
    logger.info("✅ OpenTelemetry tracing initialized successfully.")
except Exception as e:
    logger.warning(f"⚠️ OpenTelemetry tracing initialization failed: {e}. Tracing is disabled.")
    tracer = None
    otel_enabled = False

def get_tracer():
    return tracer
