from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.logger import logger, request_id_var
from app.core.middleware import RequestIDMiddleware, SecurityHeadersMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter
from app.core.config import settings
from app.routers import auth, strategy, health, admin, profile, analytics
from app.websocket.activity_socket import router as ws_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Content Strategy Platform | 5 Elite Agents | ROI Predictions | SEO Keywords | Production SaaS",
    version=settings.VERSION
)

# Startup Logging
from datetime import datetime

@app.on_event("startup")
async def startup_event():
    logger.info("================================================================")
    logger.info(f"🚀 {settings.PROJECT_NAME} Backend v{settings.VERSION}")
    logger.info("================================================================")
    
    # CrewAI Status
    if settings.GROQ_API_KEY:
        logger.info(f"✅  CrewAI Status: ENABLED (API Key found: {settings.GROQ_API_KEY[:4]}***)")
    else:
        logger.warning("⚠️  CrewAI Status: DISABLED (Missing GROQ_API_KEY)")
        logger.warning("    -> App will use DEMO MODE for strategy generation.")

    # Admin Key Status
    if settings.ADMIN_SECRET and settings.ADMIN_SECRET != "planvix-admin-2026-change-now":
        logger.info("🔒  Admin Security: CONFIGURED")
    elif settings.ADMIN_SECRET:
         logger.warning("⚠️  Admin Security: USING DEFAULT SECRET (Please change in production)")
    else:
        logger.error("❌  Admin Security: MISSING ADMIN_SECRET")
    
    logger.info("🔌  WebSocket Activity Feed: /ws/admin/activity")
    logger.info("📊  Analytics Engine: MongoDB Aggregation Based")
    logger.info("================================================================")

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
app.add_middleware(RequestIDMiddleware)

# CORS
origins = ["https://your-frontend.vercel.app"]
if settings.ENV != "production":
    origins.append("http://localhost:5173")
    origins.append("http://localhost:3000")

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
app.include_router(ws_router)  # WebSocket activity feed

@app.get("/")
async def root():
    return {
        "message": f"{settings.PROJECT_NAME} API - Premium AI Strategy Platform",
        "version": settings.VERSION,
        "docs": "/docs"
    }
