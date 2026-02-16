from fastapi import APIRouter
from app.core.mongo import mongo_client
from app.core.redis import redis_client
from app.core.config import settings
from datetime import datetime, timezone

router = APIRouter(tags=["Health"])

@router.get("/api/health")
async def health_check():
    try:
        mongo_client.admin.command('ping')
        db_status = "healthy"
    except:
        db_status = "unhealthy"
    
    return {
        "status": "operational",
        "database": db_status,
        "redis": "healthy" if redis_client.enabled else "disabled",
        "crewai": "enabled" if settings.GROQ_API_KEY else "demo mode",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
