from fastapi import APIRouter, HTTPException, status
from app.core.mongo import mongo_client
from app.core.config import settings
from datetime import datetime, timezone
from app.core.redis_health import redis_health_manager
from app.services.health_service import health_service

router = APIRouter(tags=["Health"])

@router.get("/health")
@router.get("/api/health")
async def health_check():
    """
    Returns complete system health metrics including DB, Redis, CPU, memory and uptime.
    """
    health_data = await health_service.get_health()
    # Normalize top-level status field to match requirements
    health_data["status"] = "healthy" if health_data.get("overall") == "operational" else "degraded"
    return health_data

@router.get("/ready")
async def readiness_check():
    """
    Readiness Probe: Returns 200 OK if critical dependencies (MongoDB) are available,
    otherwise returns 503 Service Unavailable.
    """
    try:
        await mongo_client.admin.command('ping')
        mongo_status = "connected"
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed"
        )
        
    redis_status = redis_health_manager.status
    return {
        "status": "ready",
        "database": mongo_status,
        "redis": redis_status
    }

@router.get("/live")
async def liveness_check():
    """
    Liveness Probe: Returns 200 OK immediately if the web process is running.
    """
    return {"status": "alive"}

