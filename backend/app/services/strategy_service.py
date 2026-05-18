from app.orchestrator.crew_orchestrator import StrategyOrchestrator
from app.models.schemas import StrategyInput, ContentStrategy
from app.core.mongo import strategies_collection
from app.core.redis import redis_client
from app.services.versioning_service import versioning_service
from app.core.logger import logger, log_event
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Callable
from bson import ObjectId
import hashlib
import json
import anyio
from app.websocket.strategy_socket import strategy_ws_manager

class StrategyService:
    """
    Enterprise Strategy Service.
    Manages the lifecycle of AI strategies with intelligent caching and multi-agent orchestration.
    """
    def __init__(self):
        self.orchestrator = StrategyOrchestrator()

    async def create_strategy(
        self, 
        user_id: str, 
        strategy_input: StrategyInput,
        progress_callback: Optional[Callable[[str, int], Any]] = None
    ) -> Dict[str, Any]:
        """
        Generates a content strategy with cache-first logic and real-time progress updates.
        """
        
        # 1. Check Intelligent Cache
        cache_key = self._generate_cache_key(strategy_input)
        cached_strategy = self._get_cached_strategy(cache_key)
        
        if cached_strategy:
            log_event("cache_hit", {"user_id": user_id, "cache_key": cache_key})
            if progress_callback: await progress_callback("Strategy retrieved from cache", 100)
            return {
                "success": True,
                "strategy": cached_strategy,
                "cached": True,
                "generation_time": 0.0,
                "message": "Strategy retrieved from cache (High-Speed)"
            }

        log_event("cache_miss", {"user_id": user_id, "cache_key": cache_key})

        # 2. Generate via Orchestrator (with Failover and Progress)
        start_time = datetime.now(timezone.utc)
        
        # Define internal progress hook for WebSocket
        async def ws_progress_callback(status_msg: str, progress_val: int):
            # Send via WS
            await strategy_ws_manager.send_progress(user_id, status_msg, progress_val)
            # Call original callback if exists
            if progress_callback:
                if anyio.is_async_callable(progress_callback):
                    await progress_callback(status_msg, progress_val)
                else:
                    progress_callback(status_msg, progress_val)

        try:
            from app.services.intelligence import intelligence_service
            from app.services.prediction import growth_predictor

            strategy_dict = await self.orchestrator.generate_strategy(
                strategy_input, 
                progress_callback=ws_progress_callback
            )

            # 4. Post-Process with Strategic Intelligence
            strategy_dict = intelligence_service.deduplicate_content(strategy_dict)
            strategy_dict = intelligence_service.apply_funnel_logic(strategy_dict)
            strategy_dict = growth_predictor.predict_growth(strategy_dict)

            # 5. Convert to Pydantic and Save
            strategy = ContentStrategy(**strategy_dict)
            strategy_data = strategy.dict()

        except Exception as e:
            logger.error(f"❌ Strategy Generation Failed for user {user_id}: {e}")
            await strategy_ws_manager.send_progress(user_id, "Generation Failed", 0, {"error": str(e)})
            raise e

        generation_time = (datetime.now(timezone.utc) - start_time).total_seconds()

        # 3. Enrich with Enterprise Metadata
        strategy_data["metadata"].update({
            "difficulty_score": 8 if strategy_input.strategy_mode == 'aggressive' else 4,
            "confidence_score": 85 if strategy_input.strategy_mode == 'conservative' else 70,
            "growth_velocity_score": 90 if strategy_input.strategy_mode == 'aggressive' else 60,
            "generation_time": generation_time,
            "user_id": user_id
        })

        # 4. Persistence & Versioning
        new_version = await versioning_service.get_next_version(user_id, strategy_input)
        
        strategy_doc = {
            "user_id": user_id,
            "goal": strategy_input.goal,
            "audience": strategy_input.audience,
            "industry": strategy_input.industry,
            "platform": strategy_input.platform,
            "content_type": strategy_input.contentType,
            "strategy_mode": strategy_input.strategy_mode,
            "version": new_version,
            "metadata": strategy_data["metadata"],
            "strategic_overview": strategy_data.get("strategic_overview"),
            "growth_intelligence": strategy_data.get("growth_intelligence"),
            "strategic_narrative": strategy_data.get("strategic_narrative"),
            "content_pillars": strategy_data.get("content_pillars"),
            "content_calendar": strategy_data.get("content_calendar"),
            "keywords": strategy_data.get("keywords"),
            "roi_prediction": strategy_data.get("roi_prediction"),
            "cache_key": cache_key,
            "generation_time": int(generation_time),
            "created_at": datetime.now(timezone.utc),
            "is_deleted": False
        }

        result = await strategies_collection.insert_one(strategy_doc)

        # 5. Update Intelligent Cache (TTL based on mode or defaults)
        ttl = 86400 * 7 if strategy_input.strategy_mode == "conservative" else 86400
        self._set_cached_strategy(cache_key, strategy_data, ttl=ttl)
        
        # 6. Usage Accounting
        await self._increment_usage_mongo(user_id)
        self._increment_usage_redis(user_id)

        log_event("strategy_created", {
            "user_id": user_id, 
            "strategy_id": str(result.inserted_id),
            "time": generation_time
        })

        return {
            "success": True,
            "strategy": strategy_data,
            "cached": False,
            "generation_time": generation_time,
            "message": "Strategy generated successfully",
            "version": new_version,
            "id": str(result.inserted_id)
        }

    async def get_user_history(self, user_id: str, limit: int = 50) -> list:
        cursor = strategies_collection.find({
            "user_id": user_id,
            "is_deleted": {"$ne": True}
        }).sort("created_at", -1).limit(limit)
        
        strategies = await cursor.to_list(length=limit)
        for s in strategies:
            s["id"] = str(s["_id"])
            del s["_id"]
            if isinstance(s.get("created_at"), datetime):
                s["created_at"] = s["created_at"].isoformat()
        return strategies

    async def get_strategy_by_id(self, strategy_id: str, user_id: str) -> Optional[dict]:
        try:
            strategy_doc = await strategies_collection.find_one({
                "_id": ObjectId(strategy_id),
                "user_id": user_id
            })
            if not strategy_doc: return None
            
            strategy_doc["id"] = str(strategy_doc["_id"])
            del strategy_doc["_id"]
            if isinstance(strategy_doc.get("created_at"), datetime):
                strategy_doc["created_at"] = strategy_doc["created_at"].isoformat()
            return strategy_doc
        except Exception:
            return None

    # === Internal Helpers ===

    async def _increment_usage_mongo(self, user_id: str):
        from app.core.mongo import users_collection
        current_month = datetime.now(timezone.utc).strftime("%Y-%m")
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"usage_count": 1}, "$set": {"usage_month": current_month}},
            upsert=True
        )

    def _increment_usage_redis(self, user_id: str):
        if not redis_client.enabled: return
        try:
            current_month = datetime.now(timezone.utc).strftime("%Y-%m")
            redis_client.client.incr(f"usage:{user_id}:{current_month}")
        except Exception as e:
            logger.warning(f"Redis usage increment failed: {e}")

    def _generate_cache_key(self, si: StrategyInput) -> str:
        # Deterministic key for AI output stability
        components = [
            "v3",
            si.goal.lower().strip(),
            si.audience.lower().strip(),
            si.industry.lower().strip(),
            si.platform.lower().strip(),
            si.contentType.lower().strip(),
            si.strategy_mode.lower()
        ]
        return hashlib.sha256("|".join(components).encode()).hexdigest()

    def _get_cached_strategy(self, cache_key: str):
        if not redis_client.enabled: return None
        try:
            data = redis_client.get(f"strat_cache:{cache_key}")
            return json.loads(data) if data else None
        except Exception: return None

    def _set_cached_strategy(self, cache_key: str, data: dict, ttl: int):
        if not redis_client.enabled: return
        try:
            redis_client.set(f"strat_cache:{cache_key}", json.dumps(data), ex=ttl)
        except Exception: pass

# Singleton instance
strategy_service = StrategyService()
