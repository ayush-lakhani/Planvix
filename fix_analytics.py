import sys

with open("backend/app/services/analytics_service.py", "r", encoding="utf-8") as f:
    content = f.read()

get_users_index = content.find("    async def get_users(")
if get_users_index == -1:
    print("Could not find get_users")
    sys.exit(1)

valid_content = content[:get_users_index]

new_code = """    async def get_users(
        self,
        search: str = "",
        tier: str = "",
        page: int = 1,
        limit: int = 20,
        sort_by: str = "created_at",
        sort_dir: int = -1
    ) -> dict:
        query = {}
        if search:
            query["$or"] = [
                {"email": {"$regex": search, "$options": "i"}},
                {"name": {"$regex": search, "$options": "i"}},
            ]
        if tier and tier != "all":
            query["tier"] = {"$regex": f"^{tier}$", "$options": "i"}

        total = users_collection.count_documents(query)
        skip = (page - 1) * limit

        valid_sorts = {"created_at", "email", "tier", "usage_count"}
        sort_field = sort_by if sort_by in valid_sorts else "created_at"

        users = list(
            users_collection.find(query)
            .sort(sort_field, sort_dir)
            .skip(skip)
            .limit(limit)
        )

        result = []
        for u in users:
            uid = str(u["_id"])
            strategies_count = strategies_collection.count_documents({"user_id": uid})
            tokens_used = 0
            try:
                tk = list(strategies_collection.aggregate([
                    {"$match": {"user_id": uid}},
                    {"$group": {"_id": None, "t": {"$sum": {"$ifNull": ["$tokens_used", 0]}}}}
                ]))
                tokens_used = tk[0]["t"] if tk else strategies_count * 800
            except Exception:
                tokens_used = strategies_count * 800

            result.append({
                "id": uid,
                "email": u.get("email", ""),
                "name": u.get("name", ""),
                "tier": u.get("tier", "free"),
                "created_at": u.get("created_at", "").isoformat() if isinstance(u.get("created_at"), datetime) else str(u.get("created_at", "")),
                "last_active": u.get("last_active", u.get("created_at", "")).isoformat() if isinstance(u.get("last_active", u.get("created_at")), datetime) else "",
                "strategies_count": strategies_count,
                "usage_count": u.get("usage_count", 0),
                "tokens_used": tokens_used,
                "subscription_status": u.get("subscription_status", "active"),
                "industry": u.get("industry", ""),
                "revenue_generated": (PRO_MONTHLY_PRICE if u.get("tier") == "pro" else ENTERPRISE_MONTHLY_PRICE if u.get("tier") == "enterprise" else 0),
            })

        return {"users": result, "total": total, "page": page, "limit": limit, "pages": max(1, -(-total // limit))}

    # ════════════════════════════════════════════════════════
    # RECENT ACTIVITY (REST fallback)
    # ════════════════════════════════════════════════════════
    async def get_recent_activity(self, limit: int = 50) -> list:
        recent = list(strategies_collection.find().sort("created_at", -1).limit(limit))
        activities = []
        for s in recent:
            dt = s.get("created_at")
            time_str = dt.strftime("%H:%M") if isinstance(dt, datetime) else "Just now"
            activities.append({
                "type": "strategy_generated",
                "user": s.get("user_id", ""),
                "action": "Generated Strategy",
                "time": time_str,
                "timestamp": dt.isoformat() if isinstance(dt, datetime) else "",
                "details": (s.get("goal") or "")[:40],
            })
        return activities

    # ════════════════════════════════════════════════════════
    # ADMIN LOGS
    # ════════════════════════════════════════════════════════
    async def get_admin_logs(self, limit: int = 100) -> list:
        logs_col = db["admin_logs"]
        logs = list(logs_col.find().sort("timestamp", -1).limit(limit))
        result = []
        for log in logs:
            result.append({
                "id": str(log["_id"]),
                "action": log.get("action", ""),
                "admin": log.get("admin", "admin"),
                "details": log.get("details", ""),
                "timestamp": log.get("timestamp", datetime.now(timezone.utc)).isoformat() if isinstance(log.get("timestamp"), datetime) else str(log.get("timestamp", "")),
                "severity": log.get("severity", "info"),
            })
        return result

    # ════════════════════════════════════════════════════════
    # LEGACY COMPATIBILITY (keep old dashboard route working)
    # ════════════════════════════════════════════════════════
    async def get_dashboard_stats(self) -> dict:
        analytics = await self.get_analytics()
        kpi = analytics["kpis"]
        return {
            "revenue": {
                "mrr": f"₹{kpi['mrr']}",
                "pro_users": kpi["pro_users"],
                "conversion_rate": f"{round(kpi['paid_users'] / kpi['total_users'] * 100, 1) if kpi['total_users'] else 0}%"
            },
            "usage": {
                "active_users": kpi["total_users"],
                "total_strategies": kpi["active_strategies"],
                "active_strategies": kpi["active_strategies"],
                "strategies_today": strategies_collection.count_documents({
                    "created_at": {"$gte": datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)}
                })
            },
            "system": {
                "mongodb_healthy": True,
                "redis_healthy": False,
                "crew_ai_enabled": True
            }
        }

    async def get_revenue_breakdown(self) -> list:
        analytics = await self.get_analytics()
        return [{"_id": i["industry"], "count": i["count"]} for i in analytics["industry_breakdown"]]

    async def get_system_alerts(self) -> list:
        return []

    # ════════════════════════════════════════════════════════
    # USER SPECIFIC ANALYTICS
    # ════════════════════════════════════════════════════════
    async def get_user_analytics(self, user_id: str) -> dict:
        \"\"\"Compute analytics for a specific user\"\"\"
        cache_key = f"user:analytics:{user_id}"
        cached = redis_client.get(cache_key)
        if cached:
            try:
                return json.loads(cached)
            except Exception:
                pass

        now = datetime.now(timezone.utc)
        thirty_days_ago = now - timedelta(days=30)
        
        # Strategies count
        total_strategies = strategies_collection.count_documents({"user_id": user_id, "is_deleted": {"$ne": True}})
        
        # Industry breakdown for user
        industry_pipeline = [
            {"$match": {"user_id": user_id, "industry": {"$exists": True, "$ne": None}}},
            {"$group": {"_id": "$industry", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        industries = _safe_list(strategies_collection.aggregate(industry_pipeline))
        
        # Token usage trend
        token_trend_pipeline = [
            {"$match": {"user_id": user_id, "created_at": {"$gte": thirty_days_ago}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "tokens": {"$sum": {"$ifNull": ["$tokens_used", 800]}},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        usage_history = [
            {"date": r["_id"], "tokens": r["tokens"], "strategies": r["count"]}
            for r in _safe_list(strategies_collection.aggregate(token_trend_pipeline))
        ]
        
        # Totals
        token_sum_pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": None, "total": {"$sum": {"$ifNull": ["$tokens_used", 0]}}}}
        ]
        token_sum_raw = _safe_list(strategies_collection.aggregate(token_sum_pipeline))
        total_tokens = token_sum_raw[0]["total"] if token_sum_raw else total_strategies * 800

        result = {
            "total_strategies": total_strategies,
            "total_tokens": total_tokens,
            "usage_history": usage_history,
            "top_industries": [{"industry": r["_id"], "count": r["count"]} for r in industries],
            "most_active_industry": industries[0]["_id"] if industries else "N/A"
        }

        # Cache user metrics for 60 seconds
        try:
            redis_client.set(cache_key, json.dumps(result, default=str), ex=60)
        except Exception:
            pass
        return result

analytics_service = AnalyticsService()
"""

with open("backend/app/services/analytics_service.py", "w", encoding="utf-8") as f:
    f.write(valid_content + new_code)

print("Done")
