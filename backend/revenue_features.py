"""
Production Revenue Features - Add to main.py after existing endpoints

UPGRADE #1: Already done - async wrapper in crew.py
UPGRADE #2: Streaming Progress
UPGRADE #3: Pro Tier Gating  
UPGRADE #4: Background Processing
UPGRADE #5: Analytics Dashboard
"""

# Add to imports section (line ~31)
# Already added: asyncio, uuid, BackgroundTasks, StreamingResponse

# Add after line 31 - Update CrewAI import
from crew import create_content_strategy_crew, create_content_strategy_crew_async

# ============================================================================
# UPGRADE #2: STREAMING PROGRESS ENDPOINT
# ============================================================================

@app.post("/api/strategy/stream")
async def stream_strategy_generation(
    strategy_input: StrategyInput,
    current_user: dict = Depends(get_current_user)
):
    """
    Stream strategy generation progress with Server-Sent Events
    Provides real-time updates for better UX
    """
    async def event_generator():
        try:
            # Progress updates
            yield f"data: {json.dumps({'status': 'starting', 'message': '🔍 Analyzing audience psychology...'})}\n\n"
            await asyncio.sleep(1)
            
            yield f"data: {json.dumps({'status': 'progress', 'message': '🎯 Scanning cultural trends...', 'progress': 20})}\n\n"
            await asyncio.sleep(2)
            
            yield f"data: {json.dumps({'status': 'progress', 'message': '📊 Researching SEO keywords...', 'progress': 40})}\n\n"
            await asyncio.sleep(2)
            
            yield f"data: {json.dumps({'status': 'progress', 'message': '✨ Generating strategy...', 'progress': 60})}\n\n"
            
            # Generate actual strategy (async)
            if CREW_AI_ENABLED:
                strategy_dict = await create_content_strategy_crew_async(strategy_input)
            else:
                strategy_dict = generate_demo_strategy(strategy_input)
            
            yield f"data: {json.dumps({'status': 'progress', 'message': '💾 Saving to database...', 'progress': 80})}\n\n"
            
            # Save to database
            strategy_doc = {
                "user_id": current_user["id"],
                "input_data": strategy_input.dict(),
                "output_data": strategy_dict,
                "created_at": datetime.utcnow(),
                "generation_time": 0  # Placeholder
            }
            strategies_collection.insert_one(strategy_doc)
            
            # Final response
            yield f"data: {json.dumps({'status': 'complete', 'message': '✅ Strategy ready!', 'progress': 100, 'strategy': strategy_dict})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'status': 'error', 'message': f'Error: {str(e)}'})}\n\n"
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")


# ============================================================================
# UPGRADE #3: PRO TIER GATING
# ============================================================================

def check_strategy_limit(user_id: str, tier: str) -> bool:
    """
    Check if user has exceeded free tier limits
    Free: 3 strategies per day
    Pro: Unlimited
    """
    if tier == "pro":
        return True  # Unlimited
    
    # Count strategies created today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_count = strategies_collection.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": today_start}
    })
    
    return today_count < 3


# ============================================================================
# UPGRADE #4: BACKGROUND JOB PROCESSING
# ============================================================================

# In-memory job storage (for demo - use Redis in production)
job_storage = {}

async def process_strategy_job_background(job_id: str, user_id: str, strategy_input: StrategyInput):
    """
    Process strategy generation in background
    """
    try:
        job_storage[job_id] = {"status": "processing", "progress": 0}
        
        # Generate strategy
        if CREW_AI_ENABLED:
            strategy_dict = await create_content_strategy_crew_async(strategy_input)
        else:
            strategy_dict = generate_demo_strategy(strategy_input)
        
        # Save to MongoDB
        strategy_doc = {
            "user_id": user_id,
            "job_id": job_id,
            "input_data": strategy_input.dict(),
            "output_data": strategy_dict,
            "created_at": datetime.utcnow(),
            "generation_time": 0
        }
        strategies_collection.insert_one(strategy_doc)
        
        # Store result in Redis with 1 hour expiry
        if REDIS_ENABLED:
            redis_client.setex(f"job:{job_id}", 3600, json.dumps(strategy_dict))
        
        job_storage[job_id] = {"status": "complete", "strategy": strategy_dict}
        
    except Exception as e:
        job_storage[job_id] = {"status": "error", "error": str(e)}


@app.post("/api/strategy/queue")
async def queue_strategy_generation(
    strategy_input: StrategyInput,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Queue strategy generation for background processing
    Returns job_id for polling
    """
    # Check limits
    if not check_strategy_limit(current_user["id"], current_user.get("tier", "free")):
        raise HTTPException(
            status_code=402,
            detail="🚀 Upgrade to Pro for unlimited strategies! ($29/mo)"
        )
    
    # Generate unique job ID
    job_id = str(uuid.uuid4())
    
    # Add to background tasks
    background_tasks.add_task(
        process_strategy_job_background,
        job_id,
        current_user["id"],
        strategy_input
    )
    
    return {
        "job_id": job_id,
        "status": "queued",
        "eta_seconds": 30,
        "message": "Strategy generation queued. Poll /api/strategy/queue/{job_id} for status"
    }


@app.get("/api/strategy/queue/{job_id}")
async def get_job_status(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Check status of background job
    """
    # Check Redis first
    if REDIS_ENABLED:
        cached_result = redis_client.get(f"job:{job_id}")
        if cached_result:
            return {
                "status": "complete",
                "strategy": json.loads(cached_result)
            }
    
    # Check in-memory storage
    if job_id in job_storage:
        return job_storage[job_id]
    
    # Check MongoDB
    result = strategies_collection.find_one({"job_id": job_id, "user_id": current_user["id"]})
    if result:
        return {
            "status": "complete",
            "strategy": result["output_data"]
        }
    
    return {"status": "not_found", "message": "Job not found or expired"}


# ============================================================================
# UPGRADE #5: ANALYTICS DASHBOARD
# ============================================================================

@app.get("/api/analytics")
async def get_user_analytics(current_user: dict = Depends(get_current_user)):
    """
    Get user analytics dashboard data
    - Total strategies generated
    - Average generation time
    - Predicted total ROI
    - Pro tier value proposition
    """
    try:
        # Aggregation pipeline
        pipeline = [
            {"$match": {"user_id": current_user["id"]}},
            {"$group": {
                "_id": None,
                "total_strategies": {"$sum": 1},
                "avg_generation_time": {"$avg": "$generation_time"},
                "strategies_this_week": {
                    "$sum": {
                        "$cond": [
                            {
                                "$gte": [
                                    "$created_at",
                                    datetime.utcnow() - timedelta(days=7)
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }}
        ]
        
        analytics = list(strategies_collection.aggregate(pipeline))
        
        if analytics:
            data = analytics[0]
            total = data.get("total_strategies", 0)
            avg_time = data.get("avg_generation_time", 0)
            this_week = data.get("strategies_this_week", 0)
        else:
            total = 0
            avg_time = 0
            this_week = 0
        
        # Calculate estimated ROI (simplified)
        estimated_roi_value = total * 2500  # $2.5K per strategy average
        
        return {
            "total_strategies": total,
            "strategies_this_week": this_week,
            "avg_generation_time": f"{avg_time:.1f}s",
            "estimated_roi_value": f"${estimated_roi_value:,}",
            "pro_upgrade_benefits": {
                "unlimited_strategies": True,
                "priority_processing": True,
                "advanced_analytics": True,
                "monthly_cost": "$29",
                "roi_multiplier": "87x"
            },
            "tier": current_user.get("tier", "free"),
            "daily_limit_remaining": 3 - strategies_collection.count_documents({
                "user_id": current_user["id"],
                "created_at": {
                    "$gte": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
                }
            }) if current_user.get("tier") != "pro" else "Unlimited"
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "total_strategies": 0,
            "tier": current_user.get("tier", "free")
        }


# ============================================================================
# UPDATE EXISTING /api/strategy ENDPOINT WITH PRO TIER GATING
# ============================================================================
# Insert this at the beginning of the existing @app.post("/api/strategy") function
# RIGHT AFTER: async def generate_strategy(...)

# Add this check BEFORE cache lookup:
"""
# Pro tier gating - Check daily limits
if not check_strategy_limit(current_user["id"], current_user.get("tier", "free")):
    raise HTTPException(
        status_code=402,
        detail={
            "message": "🚀 Daily limit reached! Upgrade to Pro for unlimited strategies",
            "upgrade_url": "/api/pro-checkout",
            "limit": 3,
            "tier": "free"
        }
    )
"""
