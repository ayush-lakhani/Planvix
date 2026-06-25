import sys
import io

# ─── CRITICAL: Fix Unicode on Windows ──────────────────────────────────────
# CrewAI / LiteLLM wraps sys.stdout with the Windows default encoding (cp1252).
# Emoji chars like ✅ ❌ 🤖 are not in cp1252 → UnicodeEncodeError at startup.
# Reconfigure BEFORE any other import.
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    else:
        sys.stdout = io.TextIOWrapper(
            sys.stdout.buffer, encoding="utf-8", errors="replace"
        )
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    else:
        sys.stderr = io.TextIOWrapper(
            sys.stderr.buffer, encoding="utf-8", errors="replace"
        )
except Exception:
    pass
# ───────────────────────────────────────────────────────────────────────────

from dotenv import load_dotenv
load_dotenv()


from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.logger import logger, request_id_var
from app.core.middleware import (
    RequestIDMiddleware, 
    SecurityHeadersMiddleware, 
    UserStateMiddleware,
    TimingMiddleware,
    ObservabilityMiddleware
)
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter
from app.core.config import settings
from app.routers import auth, strategy, health, admin, profile, analytics, payment
from app.websocket.activity_socket import router as ws_router
from app.websocket.strategy_socket import router as strategy_ws_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Content Strategy Platform | 5 Elite Agents | ROI Predictions | SEO Keywords | Production SaaS",
    version=settings.VERSION
)

# Startup Logging
from datetime import datetime

from app.core.config import settings, validate_environment
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response
from app.core.telemetry import RATE_LIMIT_HIT_COUNT
from app.core.rate_limit import get_client_ip

@app.on_event("startup")
async def startup_event():
    # Call environment variable validations
    validate_environment()

    logger.info("================================================================")
    logger.info(f"planvIx Backend v{settings.VERSION}")
    logger.info("================================================================")
    
    # CrewAI Status
    if settings.GROQ_API_KEY:
        logger.info(f"CrewAI Status: ENABLED (API Key found: {settings.GROQ_API_KEY[:4]}***)")
    else:
        logger.warning("CrewAI Status: DISABLED (Missing GROQ_API_KEY)")
        logger.warning("    -> App will use DEMO MODE for strategy generation.")

    # Admin Key Status
    if settings.ADMIN_SECRET and settings.ADMIN_SECRET != "planvix-admin-2026-change-now":
        logger.info("Admin Security: CONFIGURED")
    elif settings.ADMIN_SECRET:
         logger.warning("Admin Security: USING DEFAULT SECRET (Please change in production)")
    else:
        logger.error("Admin Security: MISSING ADMIN_SECRET")
    
    logger.info("WebSocket Activity Feed: /ws/admin/activity")
    logger.info("Analytics Engine: MongoDB Aggregation Based")
    logger.info("================================================================")
    
    # Initialize DB
    from app.core.mongo import init_db
    await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Graceful shutdown: closing connections and flushing logs...")
    
    # Close Redis client connection pool
    try:
        from app.core.redis import redis_client
        redis_client.close()
        logger.info("Redis connection closed.")
    except Exception as e:
        logger.error(f"Error during Redis client close: {e}")
        
    # Flush logs
    try:
        import logging
        for handler in logging.getLogger().handlers:
            handler.flush()
        logger.info("Logs flushed successfully.")
    except Exception as e:
        print(f"Error flushing logs: {e}")
        
    logger.info("Graceful shutdown complete.")

# Add rate limiter to app
app.state.limiter = limiter

async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    endpoint = request.url.path
    user_id = getattr(request.state, "user_id", "anonymous")
    client_ip = get_client_ip(request)
    
    try:
        RATE_LIMIT_HIT_COUNT.labels(
            endpoint=endpoint,
            user_id=user_id,
            client_ip=client_ip
        ).inc()
    except Exception:
        pass
        
    logger.warning(f"Rate limit exceeded: path={endpoint}, user_id={user_id}, ip={client_ip}")
    return JSONResponse(
        status_code=429,
        content={"detail": f"Rate limit exceeded: {exc.detail or 'Too many requests'}"}
    )

app.add_exception_handler(RateLimitExceeded, custom_rate_limit_handler)

@app.get("/metrics")
@app.get("/api/metrics")
async def metrics_endpoint():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    req_id = request_id_var.get()
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "request_id": req_id}
    )

# Validation Error Handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

# Middlewares
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(ObservabilityMiddleware)
app.add_middleware(TimingMiddleware)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(UserStateMiddleware)
app.add_middleware(RequestIDMiddleware)

# CORS
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
]

# Add Vercel dynamic preview URLs in production if needed, or stick to configured FRONTEND_URL
if settings.ENV == "production":
    # If using Vercel, the FRONTEND_URL environment variable should be set to the production domain.
    pass

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(strategy.router)
app.include_router(health.router)
app.include_router(admin.router)
app.include_router(profile.router)
app.include_router(analytics.router)
app.include_router(payment.router)
app.include_router(ws_router)  # WebSocket activity feed
app.include_router(strategy_ws_router) # Strategy generation progress

@app.get("/")
async def root():
    return {
        "message": f"{settings.PROJECT_NAME} API - Premium AI Strategy Platform",
        "version": settings.VERSION,
        "docs": "/docs"
    }
