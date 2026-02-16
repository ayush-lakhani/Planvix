from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import StrategyInput, StrategyResponse, HistoryResponse
from app.core.security import get_current_user
from app.core.mongo import db
from app.core.config import settings
from app.services.strategy_service import strategy_service
from datetime import datetime, timedelta, timezone
import hashlib
import json
import time

router = APIRouter(prefix="/api", tags=["Strategy"])

# ============================================================================
# RATE LIMITING HELPERS
# ============================================================================

FREE_LIMIT = 10
WINDOW_HOURS = 5

def check_rate_limit(user_id: str, tier: str = "free") -> dict:
    """Check if user has exceeded rate limit based on tier"""
    # Define limits based on tier
    if tier == "pro":
        limit = 50
    elif tier == "expert":
        limit = 100
    else:
        limit = FREE_LIMIT

    now = datetime.now(timezone.utc)
    window_start = now - timedelta(hours=WINDOW_HOURS)
    
    used = db.rate_limits.count_documents({
        "user_id": user_id,
        "timestamp": {"$gte": window_start}
    })
    
    if used >= limit:
        reset_time = window_start + timedelta(hours=WINDOW_HOURS)
        if reset_time < now:
             reset_time = now + timedelta(minutes=1)
             
        diff = (reset_time - now).total_seconds()
        reset_h = int(diff // 3600)
        reset_m = int((diff % 3600) // 60)
        
        return {
            "exceeded": True,
            "message": f"{tier.capitalize()} tier limit ({limit}) reached. Resets in {reset_h}h {reset_m}m",
            "reset_at": reset_time.timestamp(),
            "used": used,
            "limit": limit
        }
    
    # Record usage (counting attempts)
    db.rate_limits.insert_one({
        "user_id": user_id,
        "timestamp": now
    })
    
    return {
        "exceeded": False,
        "used": used + 1,
        "limit": limit
    }

# ============================================================================
# CACHING UTILITIES
# ============================================================================

def generate_cache_key(strategy_input: StrategyInput) -> str:
    version = "v2"
    input_str = f"{version}|{strategy_input.goal}|{strategy_input.audience}|{strategy_input.industry}|{strategy_input.platform}|{strategy_input.contentType}|{strategy_input.experience}"
    return hashlib.md5(input_str.encode()).hexdigest()

def get_cached_strategy(cache_key: str):
    if not redis_client.enabled:
        return None
    try:
        cached = redis_client.get(f"strategy:{cache_key}")
        return json.loads(cached) if cached else None
    except:
        return None

def set_cached_strategy(cache_key: str, strategy: dict, ttl: int = 86400):
    if not redis_client.enabled:
        return
    try:
        redis_client.setex(f"strategy:{cache_key}", ttl, json.dumps(strategy))
    except:
        pass


@router.post("/strategy")
async def generate_strategy(
    strategy_input: StrategyInput,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    tier = current_user.get("tier", "free")
    
    # Rate Limiting
    rate_info = check_rate_limit(user_id, tier)
    if rate_info["exceeded"]:
        raise HTTPException(status_code=429, detail=rate_info)
    
    try:
        # Delegate to Service
        result = await strategy_service.create_strategy(user_id, strategy_input)
        
        # Inject usage info into response for frontend convenience
        result["usage"] = rate_info
        result["tier"] = tier
        
        return result
        
    except Exception as e:
        print(f"❌ Strategy Generation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    strategies = await strategy_service.get_user_history(current_user["id"])
    return {
        "history": strategies,
        "count": len(strategies)
    }

# NEW: Get specific strategy
@router.get("/history/{strategy_id}")
async def get_strategy_by_id(strategy_id: str, current_user: dict = Depends(get_current_user)):
    strategy_doc = await strategy_service.get_strategy_by_id(strategy_id, current_user["id"])
    if not strategy_doc:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return strategy_doc

# ============================================================================
# NEW: Delete specific strategy (SOFT DELETE)
# ============================================================================
@router.delete("/history/{strategy_id}")
async def delete_strategy(strategy_id: str, current_user: dict = Depends(get_current_user)):
    result = await strategy_service.delete_strategy(strategy_id, current_user["id"])
    if not result["success"]:
        raise HTTPException(status_code=result.get("code", 500), detail=result["message"])
    return result


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    stats = await strategy_service.get_user_usage_stats(current_user["id"])
    
    return {
        "email": current_user.get("email"),
        "tier": current_user.get("tier", "free"),
        "usage_count": stats["usage_count"],
        "total_strategies": stats["total_strategies"],
        "created_at": current_user.get("created_at"),
        "razorpay_subscription_id": current_user.get("razorpay_subscription_id")
    }
