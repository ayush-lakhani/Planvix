from app.core.mongo import strategies_collection, users_collection
from app.core.redis import redis_client
from app.core.config import settings
from datetime import datetime, timezone

class AnalyticsService:
    async def get_dashboard_stats(self) -> dict:
        # Usage Stats
        total_strategies = strategies_collection.count_documents({}) # LIFETIME
        active_strategies = strategies_collection.count_documents({"is_deleted": {"$ne": True}})
        
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        strategies_today = strategies_collection.count_documents({"created_at": {"$gte": today_start}})
        
        total_users = users_collection.count_documents({})
        pro_users = users_collection.count_documents({"tier": "pro"})
        
        # Revenue (Simulated based on counts)
        mrr = pro_users * 29 # $29/mo plan
        conversion_rate = (pro_users / total_users * 100) if total_users > 0 else 0
        
        # System Health
        mongodb_healthy = True # If we query above, it works
        redis_healthy = False
        if redis_client.enabled:
            redis_healthy = bool(redis_client.ping())
                
        return {
            "revenue": {
                "mrr": f"${mrr}",
                "pro_users": pro_users,
                "conversion_rate": f"{conversion_rate:.1f}%"
            },
            "usage": {
                "active_users": total_users,
                "total_strategies": total_strategies,
                "active_strategies": active_strategies,
                "strategies_today": strategies_today
            },
            "system": {
                "mongodb_healthy": mongodb_healthy,
                "redis_healthy": redis_healthy,
                "crew_ai_enabled": bool(settings.GROQ_API_KEY)
            }
        }

    async def get_users(self, search: str = "", limit: int = 20) -> list:
        query = {}
        if search:
            query["email"] = {"$regex": search, "$options": "i"}
            
        users = list(users_collection.find(query).limit(limit))
        for u in users:
            u["id"] = str(u["_id"])
            u["_id"] = str(u["_id"])
            # Get strategy count for each user
            u["strategies_count"] = strategies_collection.count_documents({"user_id": u["id"]})
            
        return users

    async def get_revenue_breakdown(self) -> list:
        pipeline = [
            {"$group": {"_id": "$industry", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        return list(strategies_collection.aggregate(pipeline))

    async def get_recent_activity(self) -> list:
        recent = list(strategies_collection.find().sort("created_at", -1).limit(10))
        activities = []
        for s in recent:
            activities.append({
                "user": s.get("user_id"),
                "action": "Generated Strategy",
                "time": s.get("created_at").strftime("%H:%M") if isinstance(s.get("created_at"), datetime) else "Just now",
                "details": s.get("goal")[:30] + "..." if s.get("goal") else "No goal"
            })
        return activities

    async def get_system_alerts(self) -> list:
        alerts = []
        if not settings.GROQ_API_KEY:
            alerts.append({
                "type": "error",
                "title": "LLM API Key Missing",
                "message": "CrewAI is disabled. Add GROQ_API_KEY to .env",
                "impact": "Critical"
            })
        if not redis_client.enabled:
             alerts.append({
                "type": "warning",
                "title": "Redis Disabled",
                "message": "Caching and queues are disabled.",
                "impact": "Performance"
            })
        return alerts

analytics_service = AnalyticsService()
