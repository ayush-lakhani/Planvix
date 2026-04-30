from fastapi import APIRouter, HTTPException, status
from app.core.mongo import mongo_client
from app.core.redis import redis_client
from app.core.config import settings
from datetime import datetime, timezone

router = APIRouter(tags=["Health"])

@router.get("/health")
@router.get("/api/health") # Keeping legacy route just in case
async def health_check():
    try:
        mongo_client.admin.command('ping')
        db_status = "connected"
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection failed"
        )
    
    return {
        "status": "ok",
        "database": db_status,
        "redis": "healthy" if redis_client.enabled else "disabled",
        "crewai": "enabled" if settings.GROQ_API_KEY else "demo mode",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
