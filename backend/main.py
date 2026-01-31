"""
FastAPI Backend with MongoDB for AI Content Strategy Planner
Production-ready with JWT auth, Redis caching, rate limiting, and CrewAI integration
"""

from fastapi import FastAPI, Depends, HTTPException, status, Request, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import redis
import hashlib
import json
import time
import os
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId
from dotenv import load_dotenv # Added for loading environment variables
load_dotenv()

# Rate Limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Razorpay for Payments
import razorpay

# Async and Streaming Support
import asyncio
import uuid
from fastapi import BackgroundTasks
from fastapi.responses import StreamingResponse

# Import CrewAI (comment out for demo mode without GROQ_API_KEY)
try:
    from crew import create_content_strategy_crew
    CREW_AI_ENABLED = bool(os.getenv("GROQ_API_KEY"))
    if CREW_AI_ENABLED:
        print("✅ CrewAI Elite Mode: Enabled")
    else:
        print("⚠️  CrewAI: GROQ_API_KEY missing - running in Demo Mode")
except:
    CREW_AI_ENABLED = False

# ============================================================================
# CONFIGURATION
# ============================================================================

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Razorpay Configuration
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
RAZORPAY_PLAN_ID = os.getenv("RAZORPAY_PLAN_ID", "")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")
RAZORPAY_ENABLED = bool(RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET)

# Initialize Razorpay client
if RAZORPAY_ENABLED:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
else:
    razorpay_client = None

# Rate Limiting Configuration
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))

# Password hashing - Using SHA256 for compatibility (Production: use Argon2)
import hashlib
import secrets

def hash_password_sha256(password: str, salt: str = None) -> str:
    """Hash password using SHA256 with salt"""
    if salt is None:
        salt = secrets.token_hex(16)
    pwd_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}${pwd_hash}"

def verify_password_sha256(password: str, hashed: str) -> bool:
    """Verify password against SHA256 hash"""
    try:
        salt, pwd_hash = hashed.split('$')
        return hashlib.sha256((password + salt).encode()).hexdigest() == pwd_hash
    except:
        return False

security = HTTPBearer()

# ============================================================================
# MONGODB SETUP
# ============================================================================

mongo_client = MongoClient(MONGODB_URL)
db = mongo_client.content_planner

# Collections
users_collection = db.users
strategies_collection = db.strategies

# Create indexes
users_collection.create_index("email", unique=True)
strategies_collection.create_index("user_id")
strategies_collection.create_index("cache_key")

# ============================================================================
# REDIS SETUP
# ============================================================================

try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    redis_client.ping()
    REDIS_ENABLED = True
except:
    REDIS_ENABLED = False
    print("⚠️  Redis not available - caching disabled")

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class StrategyInput(BaseModel):
    goal: str = Field(..., min_length=10, max_length=500)
    audience: str = Field(..., min_length=5, max_length=200)
    industry: str = Field(..., min_length=3, max_length=100)
    platform: str = Field(..., min_length=3, max_length=50)
    contentType: str = Field(default="Mixed Content", max_length=50)

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str

# ============================================================================
# FASTAPI APP
# ============================================================================

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=[f"{RATE_LIMIT_PER_MINUTE}/minute"])

app = FastAPI(
    title="AgentForge",
    description="AI-Powered Content Strategy Platform | 5 Elite Agents | ROI Predictions | SEO Keywords | Production SaaS",
    version="2.0.0-production"
)

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# AUTHENTICATION UTILITIES
# ============================================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return verify_password_sha256(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return hash_password_sha256(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    user["id"] = str(user["_id"])
    return user

# ============================================================================
# CACHING UTILITIES
# ============================================================================

def generate_cache_key(strategy_input: StrategyInput) -> str:
    input_str = f"{strategy_input.goal}|{strategy_input.audience}|{strategy_input.industry}|{strategy_input.platform}|{strategy_input.contentType}"
    return hashlib.md5(input_str.encode()).hexdigest()

def get_cached_strategy(cache_key: str) -> Optional[dict]:
    if not REDIS_ENABLED:
        return None
    try:
        cached = redis_client.get(f"strategy:{cache_key}")
        return json.loads(cached) if cached else None
    except:
        return None

def set_cached_strategy(cache_key: str, strategy: dict, ttl: int = 86400):
    if not REDIS_ENABLED:
        return
    try:
        redis_client.setex(f"strategy:{cache_key}", ttl, json.dumps(strategy))
    except:
        pass

def check_rate_limit(user_id: str, limit: int = 3) -> bool:
    if not REDIS_ENABLED:
        return True
    
    current_month = datetime.now().strftime("%Y-%m")
    key = f"strategy_count:{user_id}:{current_month}"
    
    try:
        current = redis_client.get(key)
        count = int(current) if current else 0
        print(f"📊 Rate check: User {user_id} = {count}/{limit} used")
        return count < limit
    except:
        return True

# ============================================================================
# DEMO STRATEGY DATA
# ============================================================================

def generate_demo_strategy(strategy_input: StrategyInput) -> dict:
    """Generate demo strategy when CrewAI is not available"""
    return {
        "personas": [
            {
                "name": f"{strategy_input.audience.title()} Enthusiast (Young)",
                "age_range": "18-24",
                "occupation": "Student/Early Career",
                "pain_points": ["Limited budget", "Time constraints", "Learning curve", "Overwhelmed by options", "Need quick results"],
                "desires": ["Affordable solutions", "Easy to use", "Quick wins", "Build skills", "Feel confident"],
                "objections": ["Too expensive", "Not sure if it works", "Already tried others", "No time to learn", "Quality concerns"],
                "daily_habits": [f"Checks {strategy_input.platform} daily", "Consumes content during commute", "Engages in evening", "Weekend planning", "Follows trends"],
                "content_preferences": ["Short video", "Quick tips", "Behind-the-scenes", "Trendy content", "Mobile-friendly"]
            },
            {
                "name": f"{strategy_input.audience.title()} Professional",
                "age_range": "25-34",
                "occupation": "Working Professional",
                "pain_points": ["Limited time", "Struggling with consistency", "Unsure about strategy", "Algorithm changes", "Difficulty measuring ROI"],
                "desires": ["Grow authentically", "Create easily", "Build brand", "Monetize expertise", "Save time"],
                "objections": ["Too expensive", "Not sure if it works", "Already tried others", "No time to learn", "Quality concerns"],
                "daily_habits": [f"Checks {strategy_input.platform} daily", "Consumes content during commute", "Engages in evening", "Plans on weekends", "Follows influencers"],
                "content_preferences": ["Short video", "Quick tips", "Behind-the-scenes", "UGC", "Data insights"]
            },
            {
                "name": f"{strategy_input.audience.title()} Expert",
                "age_range": "35-45",
                "occupation": "Senior Professional/Manager",
                "pain_points": ["Keeping up with trends", "Delegating content creation", "ROI measurement", "Brand consistency", "Scaling challenges"],
                "desires": ["Efficient systems", "Proven strategies", "Team collaboration", "Authority building", "Long-term growth"],
                "objections": ["Implementation complexity", "Team training needed", "Budget allocation", "Risk of change", "Competitive concerns"],
                "daily_habits": [f"Strategic {strategy_input.platform} review", "Industry research", "Team meetings", "Performance analysis", "Networking"],
                "content_preferences": ["Educational posts", "Case studies", "Industry insights", "Professional content", "Long-form valuable content"]
            }
        ],
        "competitor_gaps": [
            {"gap": "Lack of personalized strategies", "impact": "High", "implementation": "AI personalization engine"},
            {"gap": "No real-time trends", "impact": "High", "implementation": "Trend monitoring"},
            {"gap": "Missing analytics", "impact": "Medium", "implementation": "Performance tracking"},
            {"gap": "Limited platform insights", "impact": "Medium", "implementation": "Platform optimization"},
            {"gap": "No collaboration", "impact": "Low", "implementation": "Team tools"}
        ],
        "keywords": [
            {
                "term": f"{strategy_input.industry.lower()} content ideas", 
                "intent": "Informational", 
                "difficulty": "Easy", 
                "monthly_searches": "5K-10K", 
                "priority": 10,
                "hashtags": [f"#{strategy_input.industry.replace(' ', '')}Content", "#ContentIdeas", "#MarketingTips", "#SocialMediaStrategy", "#ContentCreation"]
            },
            {
                "term": f"grow on {strategy_input.platform.lower()}", 
                "intent": "Informational", 
                "difficulty": "Easy", 
                "monthly_searches": "10K-50K", 
                "priority": 9,
                "hashtags": [f"#{strategy_input.platform}Growth", f"#{strategy_input.platform}Tips", "#SocialMediaGrowth", "#DigitalMarketing", "#GrowYourBusiness"]
            },
            {
                "term": f"{strategy_input.platform.lower()} tips", 
                "intent": "Informational", 
                "difficulty": "Easy", 
                "monthly_searches": "5K-10K", 
                "priority": 8,
                "hashtags": [f"#{strategy_input.platform}Tips", "#SocialMediaTips", "#MarketingHacks", "#ContentStrategy", "#DigitalMarketing"]
            },
            {
                "term": f"{strategy_input.industry.lower()} marketing", 
                "intent": "Transactional", 
                "difficulty": "Medium", 
                "monthly_searches": "5K-10K", 
                "priority": 7,
                "hashtags": [f"#{strategy_input.industry.replace(' ', '')}Marketing", "#IndustryTips", "#B2BMarketing", "#MarketingStrategy", "#BusinessGrowth"]
            },
            {
                "term": f"viral {strategy_input.platform.lower()} content", 
                "intent": "Informational", 
                "difficulty": "Medium", 
                "monthly_searches": "5K-10K", 
                "priority": 6,
                "hashtags": ["#ViralContent", f"#{strategy_input.platform}Viral", "#ContentMarketing", "#SocialMedia", "#Trending"]
            }
        ],
        "strategic_guidance": {
            "what_to_do": ["Behind-the-scenes content", "User testimonials", "Educational carousels", "Quick tip Reels", "Industry insights"],
            "how_to_do_it": ["Hook in first 3 seconds", "Add captions/text overlays", "Use trending audio", "Include clear CTA", "Post consistently"],
            "where_to_post": {
                "primary_platform": strategy_input.platform,
                "posting_locations": ["Feed", "Reels", "Stories"],
                "cross_promotion": ["TikTok (repurpose)", "YouTube Shorts"]
            },
            "when_to_post": {
                "best_days": ["Tuesday", "Thursday", "Saturday"],
                "best_times": ["9-11 AM", "1-3 PM", "7-9 PM"],
                "frequency": "3-5 times per week",
                "consistency_tips": ["Batch create on Sundays", "Schedule in advance"]
            },
            "what_to_focus_on": ["Engagement rate over followers", "Save rate for value", "Comment quality", "Share potential", "Watch time"],
            "why_it_works": ["Video captures attention faster", "Consistency trains algorithm", "Value builds trust", "Storytelling creates connection", "Clear CTAs drive action"],
            "productivity_boosters": ["Batch create content", "Use templates", "Repurpose across platforms", "Set reminders", "Plan 2 weeks ahead"],
            "things_to_avoid": ["Don't post without CTA", "Avoid overly salesy tone", "Don't ignore comments", "Avoid inconsistency", "Don't skip captions"]
        },
        "calendar": [
            {"week": 1, "day": 1, "topic": "Introduction", "format": "Reel", "caption_hook": "Here's why...", "cta": "Follow for more"},
            {"week": 1, "day": 3, "topic": "Quick Win", "format": "Carousel", "caption_hook": "Want results?", "cta": "Save this"},
            {"week": 2, "day": 2, "topic": "Educational", "format": "Post", "caption_hook": "Did you know...", "cta": "Share this"}
        ],
        "sample_posts": [
            {
                "title": "🚀 Game-Changing Strategy",
                "caption": f"If you're in {strategy_input.industry}, listen up.\n\n✅ Consistent posting\n✅ Authentic storytelling\n✅ Value-first\n\nComment 'STRATEGY' 👇",
                "hashtags": [f"#{strategy_input.industry.replace(' ', '')}", f"#{strategy_input.platform}Marketing", "#ContentStrategy"],
                "image_prompt": f"Professional workspace with {strategy_input.platform} dashboard, vibrant colors",
                "best_time": "Weekdays 9-11 AM"
            }
        ],
        "roi_prediction": {
            "traffic_lift_percentage": "18-25%",
            "engagement_boost_percentage": "35-45%",
            "estimated_monthly_reach": "5K-15K",
            "conversion_rate_estimate": "1.5-2.5%",
            "time_to_results": "30-60 days"
        }
    }

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    return {
        "message": "AgentForge API - Premium AI Strategy Platform",
        "version": "2.0.0",
        "database": "MongoDB",
        "cache": "Redis" if REDIS_ENABLED else "Disabled",
        "ai": "CrewAI Elite" if CREW_AI_ENABLED else "Demo Mode"
    }

@app.get("/api/health")
async def health_check():
    try:
        mongo_client.admin.command('ping')
        db_status = "healthy"
    except:
        db_status = "unhealthy"
    
    return {
        "status": "operational",
        "database": db_status,
        "redis": "healthy" if REDIS_ENABLED else "disabled",
        "crewai": "enabled" if CREW_AI_ENABLED else "demo mode",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/auth/signup", response_model=Token)
async def signup(user_data: UserCreate):
    if users_collection.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "email": user_data.email,
        "hashed_password": get_password_hash(user_data.password),
        "tier": "free",
        "created_at": datetime.now(timezone.utc)
    }
    
    result = users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(data={"sub": user_id})
    return Token(access_token=access_token, user_id=user_id, email=user_data.email)

@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = users_collection.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    user_id = str(user["_id"])
    access_token = create_access_token(data={"sub": user_id})
    return Token(access_token=access_token, user_id=user_id, email=user["email"])

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "tier": current_user.get("tier", "free"),
        "created_at": current_user.get("created_at")
    }

# ============================================================================
# RAZORPAY CHECKOUT (Pro Tier)
# ============================================================================

@app.post("/api/pro-checkout")
async def create_checkout_session(request: Request, current_user: dict = Depends(get_current_user)):
    """Create Razorpay subscription for Pro tier (₹2,400/mo)"""
    if not RAZORPAY_ENABLED:
        raise HTTPException(status_code=503, detail="Razorpay not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env")
    
    try:
        # Create Razorpay subscription
        subscription = razorpay_client.subscription.create({
            'plan_id': RAZORPAY_PLAN_ID,
            'customer_notify': 1,
            'quantity': 1,
            'total_count': 12,  # 12 months
            'notes': {
                'user_id': current_user["id"],
                'email': current_user["email"]
            }
        })
        
        return {
            "subscription_id": subscription['id'],
            "razorpay_key": RAZORPAY_KEY_ID
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# STRATEGY GENERATOR ENDPOINT (Coffee Format)
# ============================================================================

@app.post("/api/strategy")
async def generate_strategy(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Generate 10-section content strategy matching coffee format"""
    import time
    start_time = time.time()
    
    try:
        # Verify token
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get user
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get request data
        data = await request.json()
        topic = data.get("topic", "").strip()
        
        if not topic:
            raise HTTPException(status_code=400, detail="Topic is required")
        
        # Check usage limits (3/day for free, unlimited for pro)
        today_key = f"strategy_usage:{user_id}:{datetime.now().strftime('%Y-%m-%d')}"
        
        if REDIS_ENABLED:
            try:
                usage_today = int(redis_client.get(today_key) or 0)
                
                # Enforce limits for free tier
                if user.get("tier") != "pro" and usage_today >= 3:
                    raise HTTPException(
                        status_code=429,
                        detail="Monthly limit reached! Upgrade to Pro for unlimited strategies (₹2,400/month)"
                    )
                
                # Increment usage
                redis_client.incr(today_key)
                redis_client.expire(today_key, 86400)  # 24 hours
            except Exception as e:
                print(f"Redis error: {e}")
                usage_today = 0
        else:
            usage_today = 0
        
        
        # Generate strategy using experience-based routing
        if CREW_AI_ENABLED:
            try:
                strategy_content = generate_coffee_format_strategy(topic)
            except Exception as e:
                print(f"CrewAI error: {e}, using experience-based template")
                strategy_content = generate_experience_based_strategy(data)
        else:
            # Use experience-based generation
            strategy_content = generate_experience_based_strategy(data)
        
        # Calculate generation time
        generation_time = f"{int(time.time() - start_time)} seconds"
        
        # Get total strategies count
        total_strategies = strategies_collection.count_documents({"user_id": user_id})
        
        # Save strategy to database
        strategy_doc = {
            "user_id": user_id,
            "topic": topic,
            "content": strategy_content,
            "type": "strategy",
            "created_at": datetime.now(),
            "generation_time": generation_time,
            "feedback": None
        }
        
        result = strategies_collection.insert_one(strategy_doc)
        strategy_id = str(result.inserted_id)
        
        return {
            "id": strategy_id,
            "content": strategy_content,
            "topic": topic,
            "generation_time": generation_time,
            "usage": {
                "today": usage_today + 1,
                "total": total_strategies + 1
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Strategy generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# HISTORY ENDPOINT
# ============================================================================

@app.get("/api/history")
async def get_user_history(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all strategies for the authenticated user"""
    try:
        # Verify JWT token
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Fetch all strategies for this user, sorted by creation date (newest first)
        strategies = list(strategies_collection.find(
            {"user_id": user_id}
        ).sort("created_at", -1))
        
        # Convert ObjectId to string and format response
        formatted_strategies = []
        for strategy in strategies:
            formatted_strategies.append({
                "id": str(strategy["_id"]),
                "topic": strategy.get("topic", "Untitled Strategy"),
                "content": strategy.get("content", ""),
                "created_at": strategy.get("created_at").isoformat() if strategy.get("created_at") else None,
                "generation_time": strategy.get("generation_time", "Unknown"),
                "feedback": strategy.get("feedback")
            })
        
        return {
            "strategies": formatted_strategies,
            "total": len(formatted_strategies)
        }
        
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"❌ History fetch error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/history/{strategy_id}")
async def delete_strategy(strategy_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Delete a specific strategy"""
    try:
        # Verify JWT token
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Delete the strategy (only if it belongs to this user)
        query = {
            "_id": ObjectId(strategy_id),
            "user_id": user_id
        }
        print(f"🗑️ Attempting to delete strategy with query: {query}")
        result = strategies_collection.delete_one(query)
        
        if result.deleted_count == 0:
            print(f"⚠️ Strategy {strategy_id} not found or doesn't belong to user {user_id}")
            raise HTTPException(status_code=404, detail="Strategy not found")
        
        print(f"✅ Strategy {strategy_id} deleted successfully")
        return {"message": "Strategy deleted successfully"}
        
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"❌ Delete error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history/{strategy_id}")
async def get_strategy_by_id(strategy_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get a specific strategy by ID"""
    try:
        # Verify JWT token
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Fetch the strategy (only if it belongs to this user)
        strategy = strategies_collection.find_one({
            "_id": ObjectId(strategy_id),
            "user_id": user_id
        })
        
        if not strategy:
            raise HTTPException(status_code=404, detail="Strategy not found")
        
        # Format response
        return {
            "id": str(strategy["_id"]),
            "topic": strategy.get("topic", "Untitled Strategy"),
            "content": strategy.get("content", ""),
            "created_at": strategy.get("created_at").isoformat() if strategy.get("created_at") else None,
            "generation_time": strategy.get("generation_time", "Unknown"),
            "feedback": strategy.get("feedback")
        }
        
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"❌ Get strategy error: {e}")
        raise HTTPException(status_code=500, detail=str(e))



def generate_experience_based_strategy(data: dict) -> str:
    """Route to appropriate strategy based on experience level"""
    experience = data.get("experience", "beginner").lower()
    topic = data.get("topic", "Business")
    goal = data.get("goal", "")
    audience = data.get("audience", "")
    industry = data.get("industry", "General")
    platform = data.get("platform", "Instagram")
    content_type = data.get("contentType", "Reels")
    
    if experience == "beginner":
        return generate_beginner_strategy(topic, goal, audience, industry, platform, content_type)
    elif experience == "intermediate":
        return generate_intermediate_strategy(topic, goal, audience, industry, platform, content_type)
    elif experience == "expert":
        return generate_expert_strategy(topic, goal, audience, industry, platform, content_type)
    else:
        return generate_strategy_template(topic)


def generate_beginner_strategy(topic, goal, audience, industry, platform, content_type):
    """Beginner: Copy-paste scripts + iPhone guides"""
    return f"""
<div class="strategy-sections">
<div class="experience-badge" style="background: #10B981; color: white; padding: 0.75rem 1.5rem; border-radius: 1rem; font-weight: bold; text-align: center; margin-bottom: 2rem;">
🎯 BEGINNER MODE ACTIVATED - Copy-Paste Ready Scripts
</div>

<h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 2rem; color: #7C3AED;">
CONTENT STRATEGY FOR {topic.upper()} (BEGINNER MODE)
</h1>

<section class="strategy-section">
<h2>1. BUSINESS GOAL (Refined)</h2>
<p><strong>Your Goal:</strong> {goal or f'Grow {topic} presence on {platform}'}</p>
<p><strong>SMART Goal:</strong> Generate 10,000 engaged followers and 200 qualified leads in 90 days through consistent {content_type} content.</p>
<p><strong>Why This Works:</strong> Beginners need clear, achievable targets with step-by-step guidance.</p>
</section>

<section class="strategy-section">
<h2>2. TARGET AUDIENCE</h2>
<p><strong>Your Audience:</strong> {audience or 'Working professionals aged 25-40'}</p>
<p><strong>Where They Are:</strong> {platform} (2-3 hours daily)</p>
<p><strong>What They Want:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Quick, actionable tips</li>
<li>Relatable content</li>
<li>Clear next steps</li>
<li>No jargon or complexity</li>
</ul>
</section>

<section class="strategy-section">
<h2>3. BRAND POSITIONING</h2>
<p><strong>Your Angle:</strong> The Helpful Friend - Simple, relatable, and supportive</p>
<p><strong>Why This Works for Beginners:</strong> Authenticity beats perfection. Your audience wants real people, not polished influencers.</p>
</section>

<section class="strategy-section">
<h2>4. CONTENT PILLARS</h2>
<div style="margin-top: 1rem;">
<h3 style="color: #7C3AED;">Pillar 1: Educational Tips (40%)</h3>
<p><strong>3 Reel Ideas (Copy These):</strong></p>
<ul style="margin-left: 1.5rem;">
<li>"5 Mistakes I Made So You Don't Have To"</li>
<li>"The One Thing That Changed Everything"</li>
<li>"How I [Result] in 30 Days"</li>
</ul>
</div>

<div style="margin-top: 1.5rem;">
<h3 style="color: #7C3AED;">Pillar 2: Behind the Scenes (30%)</h3>
<p><strong>3 Reel Ideas:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>"Day in My Life" - Show your routine</li>
<li>"Real Talk" - Share struggles</li>
<li>"Morning Routine" - Relatable content</li>
</ul>
</div>

<div style="margin-top: 1.5rem;">
<h3 style="color: #7C3AED;">Pillar 3: Results & Testimonials (30%)</h3>
<p><strong>3 Reel Ideas:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>"Before vs After" - Show transformation</li>
<li>"Client Success Story"</li>
<li>"This Actually Works" - Proof</li>
</ul>
</div>
</section>

<section class="strategy-section" style="background: #DBEAFE; padding: 1.5rem; border-radius: 1rem;">
<h2 style="color: #1E40AF;">5. EXECUTION PLAN (BEGINNER-FRIENDLY)</h2>

<h3 style="color: #7C3AED; margin-top: 1rem;">🎥 REEL 1: "I Failed 47 Times..." [COPY-PASTE SCRIPT]</h3>
<div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
<p><strong>Hook (0-1 second):</strong></p>
<p style="margin-left: 1rem;">"I failed 47 times before this..." [Sad face, look down]</p>

<p style="margin-top: 1rem;"><strong>Body (2-8 seconds):</strong></p>
<p style="margin-left: 1rem;">"Until I discovered this 3-minute trick..." [Show your solution/app/product]</p>
<p style="margin-left: 1rem;">"Now I [result] every single day" [Smile, show confidence]</p>

<p style="margin-top: 1rem;"><strong>CTA (9-12 seconds):</strong></p>
<p style="margin-left: 1rem;">"Save this + DM me 'START'" [Point to screen]</p>
</div>

<h3 style="color: #7C3AED; margin-top: 1.5rem;">📱 SHOOTING GUIDE (iPhone Only)</h3>
<div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
<p><strong>Equipment:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>✅ iPhone (any model)</li>
<li>✅ Window for natural light</li>
<li>✅ Stack of books as tripod (or $15 phone holder)</li>
<li>❌ NO expensive camera needed</li>
</ul>

<p style="margin-top: 1rem;"><strong>3 Camera Positions:</strong></p>
<ol style="margin-left: 1.5rem;">
<li><strong>Table Setup:</strong> Phone on books, you sit across</li>
<li><strong>Hand-held:</strong> Arm's length, slightly above eye level</li>
<li><strong>Tripod:</strong> Chest height, 3 feet away</li>
</ol>

<p style="margin-top: 1rem;"><strong>Lighting Trick:</strong></p>
<p style="margin-left: 1rem;">Face the window. Film between 10 AM - 2 PM for best light.</p>
</div>

<h3 style="color: #7C3AED; margin-top: 1.5rem;">✂️ EDITING (CapCut - Free App)</h3>
<div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
<p><strong>Step-by-Step:</strong></p>
<ol style="margin-left: 1.5rem;">
<li>Import video to CapCut</li>
<li>Speed: Set to 1.2x (makes it snappier)</li>
<li>Audio: Search "trending {platform}" → Pick top song</li>
<li>Text: Add your hook as text overlay (yellow, bold)</li>
<li>Export: 1080x1920, 60fps</li>
</ol>
<p style="margin-top: 0.5rem;"><strong>Total Time:</strong> 5 minutes per Reel</p>
</div>

<h3 style="color: #7C3AED; margin-top: 1.5rem;">⏰ POSTING SCHEDULE (Copy to Calendar)</h3>
<div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
<table style="width: 100%; border-collapse: collapse;">
<tr style="background: #F3F4F6;">
<th style="border: 1px solid #E5E7EB; padding: 0.5rem;">Day</th>
<th style="border: 1px solid #E5E7EB; padding: 0.5rem;">Time</th>
<th style="border: 1px solid #E5E7EB; padding: 0.5rem;">Content Type</th>
</tr>
<tr>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Monday</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">8:00 AM</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Educational Tip</td>
</tr>
<tr style="background: #F9FAFB;">
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Wednesday</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">1:00 PM</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Behind the Scenes</td>
</tr>
<tr>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Friday</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">7:00 PM</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Results/Testimonial</td>
</tr>
</table>
<p style="margin-top: 0.5rem;"><strong>Why These Times:</strong> Morning commute, lunch break, evening wind-down = highest engagement</p>
</div>
</section>

<section class="strategy-section">
<h2>6. HASHTAG STRATEGY (Beginner-Friendly)</h2>
<p><strong>Use Exactly 10 Hashtags Per Post:</strong></p>
<div style="background: #F3F4F6; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
<p><strong>Copy-Paste This:</strong></p>
<p style="font-family: monospace; margin-top: 0.5rem;">
#{industry.lower()}tips #{platform.lower()}growth #contentcreator #smallbusiness #entrepreneur #socialmediatips #digitalmarketing #businessgrowth #{topic.lower().replace(' ', '')} #viral{content_type.lower()}
</p>
</div>
</section>

<section class="strategy-section">
<h2>7. ENGAGEMENT STRATEGY</h2>
<p><strong>Daily Routine (30 Minutes):</strong></p>
<ol style="margin-left: 1.5rem;">
<li><strong>Morning (10 min):</strong> Reply to all comments on your posts</li>
<li><strong>Afternoon (10 min):</strong> Comment on 20 posts in your niche</li>
<li><strong>Evening (10 min):</strong> DM 5 people who engaged with your content</li>
</ol>
<p style="margin-top: 1rem;"><strong>What to Comment:</strong> "Love this! [Specific detail about their post]" - Be genuine!</p>
</section>

<section class="strategy-section">
<h2>8. GROWTH MILESTONES</h2>
<table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
<tr style="background: #F3F4F6;">
<th style="border: 1px solid #E5E7EB; padding: 0.75rem;">Week</th>
<th style="border: 1px solid #E5E7EB; padding: 0.75rem;">Followers Goal</th>
<th style="border: 1px solid #E5E7EB; padding: 0.75rem;">Action</th>
</tr>
<tr>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">Week 1-2</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">100-500</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">Post 3x/week, engage daily</td>
</tr>
<tr style="background: #F9FAFB;">
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">Week 3-4</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">500-1,500</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">Analyze top post, create similar</td>
</tr>
<tr>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">Month 2</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">1,500-5,000</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">Collaborate with 3 similar accounts</td>
</tr>
<tr style="background: #F9FAFB;">
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">Month 3</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">5,000-10,000</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">Launch first paid offer</td>
</tr>
</table>
</section>

<section class="strategy-section">
<h2>9. BEGINNER MISTAKES TO AVOID</h2>
<div style="background: #FEE2E2; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
<p><strong>❌ DON'T:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Buy followers (kills engagement)</li>
<li>Post without a caption</li>
<li>Use 30 hashtags (looks spammy)</li>
<li>Ignore comments</li>
<li>Give up after 2 weeks</li>
</ul>
</div>

<div style="background: #D1FAE5; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
<p><strong>✅ DO:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Be consistent (3x/week minimum)</li>
<li>Engage with your audience daily</li>
<li>Save your best-performing posts</li>
<li>Ask questions in captions</li>
<li>Have fun and be yourself!</li>
</ul>
</div>
</section>

<section class="strategy-section">
<h2>10. YOUR FIRST 7 DAYS</h2>
<div style="background: #DBEAFE; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
<p><strong>Day 1:</strong> Set up profile (bio, profile pic, link)</p>
<p><strong>Day 2:</strong> Film 3 Reels using scripts above</p>
<p><strong>Day 3:</strong> Edit Reels in CapCut (5 min each)</p>
<p><strong>Day 4:</strong> Post Reel #1 at 8 AM</p>
<p><strong>Day 5:</strong> Engage 30 min, plan next week</p>
<p><strong>Day 6:</strong> Post Reel #2 at 1 PM</p>
<p><strong>Day 7:</strong> Post Reel #3 at 7 PM, celebrate! 🎉</p>
</div>
</section>

<section class="strategy-section" style="background: #FEF3C7; padding: 1.5rem; border-radius: 1rem; border-left: 4px solid #F59E0B;">
<h2 style="color: #92400E;">⚠️ BEGINNER REALITY CHECK</h2>
<div style="margin-top: 1rem;">
<p style="font-weight: 600; color: #065F46; margin-bottom: 0.5rem;">✅ This works if:</p>
<ul style="margin-left: 1.5rem; color: #065F46;">
<li>You follow the scripts exactly (don't overthink!)</li>
<li>You post 3x per week minimum</li>
<li>You engage 30 minutes daily</li>
<li>You stick with it for 90 days</li>
<li>You track what works and do more of it</li>
</ul>
</div>

<div style="margin-top: 1.5rem;">
<p style="font-weight: 600; color: #991B1B; margin-bottom: 0.5rem;">❌ This fails if:</p>
<ul style="margin-left: 1.5rem; color: #991B1B;">
<li>You try to be "perfect" (done is better than perfect!)</li>
<li>You post once and expect virality</li>
<li>You buy followers or use bots</li>
<li>You give up after 2 weeks</li>
<li>You ignore your audience</li>
</ul>
</div>

<div style="margin-top: 1.5rem; background: white; padding: 1rem; border-radius: 0.5rem;">
<p style="font-weight: bold; color: #7C3AED;">💡 BEGINNER TIP:</p>
<p>Your first 10 posts will feel awkward. That's normal! By post 20, you'll find your rhythm. By post 50, you'll be confident. Just keep going!</p>
</div>
</section>

</div>
"""


def generate_intermediate_strategy(topic, goal, audience, industry, platform, content_type):
    """Intermediate: Canva workflows + efficiency"""
    return f"""
<div class="strategy-sections">
<div class="experience-badge" style="background: #3B82F6; color: white; padding: 0.75rem 1.5rem; border-radius: 1rem; font-weight: bold; text-align: center; margin-bottom: 2rem;">
⚡ INTERMEDIATE MODE - Canva Workflows & Efficiency
</div>

<h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 2rem; color: #7C3AED;">
CONTENT STRATEGY FOR {topic.upper()} (INTERMEDIATE MODE)
</h1>

<section class="strategy-section">
<h2>1. BUSINESS GOAL (Refined)</h2>
<p><strong>Your Goal:</strong> {goal or f'Scale {topic} to 50K followers'}</p>
<p><strong>SMART Goal:</strong> Generate 50,000 engaged followers and 1,000 qualified leads in 90 days through optimized content workflows.</p>
</section>

<section class="strategy-section">
<h2>2. TARGET AUDIENCE</h2>
<p><strong>Your Audience:</strong> {audience or 'Professionals seeking efficiency'}</p>
<p><strong>Content Preferences:</strong> Polished visuals, clear value, professional tone</p>
</section>

<section class="strategy-section">
<h2>3. BRAND POSITIONING</h2>
<p><strong>Your Angle:</strong> The Efficient Expert - Professional quality with smart workflows</p>
</section>

<section class="strategy-section">
<h2>4. CONTENT PILLARS</h2>
<p><strong>Framework:</strong> 40% Educational, 30% Case Studies, 20% Tools/Resources, 10% Personal</p>
</section>

<section class="strategy-section" style="background: #DBEAFE; padding: 1.5rem; border-radius: 1rem;">
<h2 style="color: #1E40AF;">5. EXECUTION PLAN (CANVA WORKFLOWS)</h2>

<h3 style="color: #7C3AED; margin-top: 1rem;">🎨 CANVA TEMPLATE SYSTEM</h3>
<div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
<p><strong>Create 3 Master Templates:</strong></p>

<p style="margin-top: 1rem;"><strong>Template 1: Hook Overlay</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Yellow text with black outline (high contrast)</li>
<li>Font: Montserrat Bold, 72pt</li>
<li>Position: Top third of screen</li>
<li>Animation: Fade in (0.5s)</li>
</ul>

<p style="margin-top: 1rem;"><strong>Template 2: CTA Sticker</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Design: "DM 'START' NOW" + Arrow pointing right</li>
<li>Colors: Brand colors (purple/pink gradient)</li>
<li>Size: 300x150px</li>
<li>Position: Bottom right corner</li>
</ul>

<p style="margin-top: 1rem;"><strong>Template 3: Progress Bar</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Before/After split screen design</li>
<li>Progress indicator (0% → 100%)</li>
<li>Timestamp overlays</li>
</ul>
</div>

<h3 style="color: #7C3AED; margin-top: 1.5rem;">⚙️ BATCH CREATION WORKFLOW</h3>
<div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
<p><strong>Monday (2 hours) - Content Day:</strong></p>
<ol style="margin-left: 1.5rem;">
<li><strong>Film (30 min):</strong> Record 5 raw videos back-to-back</li>
<li><strong>Canva (45 min):</strong> Add graphics to all 5 videos
  <ul style="margin-left: 1rem;">
    <li>Import video to Canva</li>
    <li>Apply master template</li>
    <li>Customize text (5 min per video)</li>
    <li>Export as MP4</li>
  </ul>
</li>
<li><strong>CapCut (30 min):</strong> Add audio + transitions
  <ul style="margin-left: 1rem;">
    <li>Import from Canva</li>
    <li>Add trending audio</li>
    <li>Speed adjustments (1.1x-1.3x)</li>
    <li>Smooth transitions</li>
  </ul>
</li>
<li><strong>Schedule (15 min):</strong> Upload to Later/Planoly for the week</li>
</ol>

<p style="margin-top: 1rem;"><strong>Result:</strong> 5 professional Reels in 2 hours = 15 min per Reel</p>
</div>

<h3 style="color: #7C3AED; margin-top: 1.5rem;">📊 CONTENT CALENDAR (Copy This)</h3>
<div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
<table style="width: 100%; border-collapse: collapse;">
<tr style="background: #F3F4F6;">
<th style="border: 1px solid #E5E7EB; padding: 0.5rem;">Day</th>
<th style="border: 1px solid #E5E7EB; padding: 0.5rem;">Content Type</th>
<th style="border: 1px solid #E5E7EB; padding: 0.5rem;">Canva Template</th>
</tr>
<tr>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Mon 8AM</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Educational</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Hook Overlay</td>
</tr>
<tr style="background: #F9FAFB;">
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Wed 1PM</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Case Study</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Progress Bar</td>
</tr>
<tr>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Fri 7PM</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Tool/Resource</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">CTA Sticker</td>
</tr>
</table>
</div>
</section>

<section class="strategy-section">
<h2>6. OPTIMIZATION STRATEGY</h2>
<p><strong>Weekly Review (30 min every Sunday):</strong></p>
<ol style="margin-left: 1.5rem;">
<li>Check Instagram Insights for top 3 performing Reels</li>
<li>Identify common elements (hook, topic, format)</li>
<li>Create 2 variations of winning formula for next week</li>
<li>Archive or delete bottom 20% performers</li>
</ol>
</section>

<section class="strategy-section">
<h2>7. TOOLS STACK</h2>
<div style="background: #F3F4F6; padding: 1rem; border-radius: 0.5rem;">
<p><strong>Essential Tools:</strong></p>
<ul style="margin-left: 1.5rem;">
<li><strong>Canva Pro:</strong> $12.99/mo - Templates + brand kit</li>
<li><strong>CapCut:</strong> Free - Video editing</li>
<li><strong>Later:</strong> $18/mo - Scheduling</li>
<li><strong>Notion:</strong> Free - Content calendar</li>
</ul>
<p style="margin-top: 0.5rem;"><strong>Total Cost:</strong> ~$31/month for professional workflow</p>
</div>
</section>

<section class="strategy-section">
<h2>8. GROWTH METRICS</h2>
<p><strong>Track Weekly:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Follower growth rate (%)</li>
<li>Engagement rate (likes + comments + saves / followers)</li>
<li>Best performing content type</li>
<li>Optimal posting times</li>
</ul>
<p><strong>Goal:</strong> 5-10% engagement rate, 1000+ followers/week by Month 2</p>
</section>

<section class="strategy-section">
<h2>9. COLLABORATION STRATEGY</h2>
<p><strong>Month 2-3: Partner with 5-10 accounts</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Similar follower count (±20%)</li>
<li>Same niche, non-competing</li>
<li>Cross-promote each other's content</li>
<li>Joint Lives or challenges</li>
</ul>
</section>

<section class="strategy-section">
<h2>10. 90-DAY ROADMAP</h2>
<div style="background: #DBEAFE; padding: 1rem; border-radius: 0.5rem;">
<p><strong>Month 1:</strong> Build workflow, post 5x/week, reach 5K followers</p>
<p><strong>Month 2:</strong> Optimize top performers, collaborate, reach 20K followers</p>
<p><strong>Month 3:</strong> Scale with ads ($200-500), launch offer, reach 50K followers</p>
</div>
</section>

<section class="strategy-section" style="background: #FEF3C7; padding: 1.5rem; border-radius: 1rem;">
<h2 style="color: #92400E;">⚠️ INTERMEDIATE REALITY CHECK</h2>
<p style="color: #065F46;"><strong>✅ This works if:</strong> You batch create, track metrics, and optimize weekly</p>
<p style="color: #991B1B; margin-top: 0.5rem;"><strong>❌ This fails if:</strong> You create content daily without analyzing performance</p>
</section>

</div>
"""


def generate_expert_strategy(topic, goal, audience, industry, platform, content_type):
    """Expert: Viral frameworks + A/B testing"""
    return f"""
<div class="strategy-sections">
<div class="experience-badge" style="background: #8B5CF6; color: white; padding: 0.75rem 1.5rem; border-radius: 1rem; font-weight: bold; text-align: center; margin-bottom: 2rem;">
🚀 EXPERT MODE - Viral Frameworks & Data-Driven Optimization
</div>

<h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 2rem; color: #7C3AED;">
CONTENT STRATEGY FOR {topic.upper()} (EXPERT MODE)
</h1>

<section class="strategy-section">
<h2>1. BUSINESS GOAL (Refined)</h2>
<p><strong>Your Goal:</strong> {goal or f'Dominate {industry} on {platform}'}</p>
<p><strong>SMART Goal:</strong> Generate 100,000+ followers and $50K revenue in 90 days through viral content and conversion optimization.</p>
</section>

<section class="strategy-section">
<h2>2. TARGET AUDIENCE (Psychographic Segmentation)</h2>
<p><strong>Primary:</strong> {audience or 'High-intent buyers with proven purchasing behavior'}</p>
<p><strong>Behavioral Triggers:</strong> FOMO, social proof, authority, scarcity</p>
</section>

<section class="strategy-section">
<h2>3. BRAND POSITIONING</h2>
<p><strong>Strategy:</strong> Category King - Own the conversation in {industry}</p>
<p><strong>Differentiation:</strong> Data-driven insights + contrarian takes</p>
</section>

<section class="strategy-section">
<h2>4. CONTENT PILLARS (Viral Framework)</h2>
<p><strong>Distribution:</strong> 50% Viral Hooks, 30% Authority Building, 20% Conversion</p>
</section>

<section class="strategy-section" style="background: #F3E8FF; padding: 1.5rem; border-radius: 1rem;">
<h2 style="color: #6B21A8;">5. EXECUTION PLAN (EXPERT FRAMEWORKS)</h2>

<h3 style="color: #8B5CF6; margin-top: 1rem;">🎯 HOOK FORMULAS (3 Proven Frameworks)</h3>
<div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
<p><strong>Formula 1: Problem-Agitate-Solve</strong></p>
<ul style="margin-left: 1.5rem;">
<li><strong>Hook:</strong> "I wasted 2 years on [bad solution]"</li>
<li><strong>Agitate:</strong> "Lost $10K and countless hours..."</li>
<li><strong>Solve:</strong> "Until I discovered [your solution]"</li>
<li><strong>Proof:</strong> "Now I [specific result]"</li>
</ul>

<p style="margin-top: 1rem;"><strong>Formula 2: Contrarian Take</strong></p>
<ul style="margin-left: 1.5rem;">
<li><strong>Hook:</strong> "{Industry} influencers are lying to you"</li>
<li><strong>Expose:</strong> "They say [common advice], but..."</li>
<li><strong>Truth:</strong> "The real secret is [your method]"</li>
<li><strong>CTA:</strong> "Save this before it's deleted"</li>
</ul>

<p style="margin-top: 1rem;"><strong>Formula 3: Social Proof</strong></p>
<ul style="margin-left: 1.5rem;">
<li><strong>Hook:</strong> "How my client went from $0 to $100K in 60 days"</li>
<li><strong>Story:</strong> "They were struggling with [problem]..."</li>
<li><strong>Method:</strong> "We implemented [3-step process]"</li>
<li><strong>Result:</strong> "[Specific metrics + timeline]"</li>
</ul>
</div>

<h3 style="color: #8B5CF6; margin-top: 1.5rem;">📊 HASHTAG CLUSTERS (KD<25 Strategy)</h3>
<div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
<p><strong>Tier 1: Mega (100K-1M posts) - 3 hashtags</strong></p>
<p style="font-family: monospace; margin-left: 1rem;">#{industry}tips #{platform}marketing #viral{content_type}</p>

<p style="margin-top: 1rem;"><strong>Tier 2: Medium (10K-100K) - 5 hashtags</strong></p>
<p style="font-family: monospace; margin-left: 1rem;">#{industry}strategy #{topic.replace(' ', '')}growth #contentmarketing #{platform}expert #{industry}hacks</p>

<p style="margin-top: 1rem;"><strong>Tier 3: Niche (1K-10K) - 7 hashtags</strong></p>
<p style="font-family: monospace; margin-left: 1rem;">#{industry}2024 #{topic.replace(' ', '')}tips #{platform}algorithm #{industry}secrets #{content_type}strategy #{topic.replace(' ', '')}expert #{industry}community</p>

<p style="margin-top: 1rem;"><strong>Total: 15 hashtags per post (optimal for {platform})</strong></p>
</div>

<h3 style="color: #8B5CF6; margin-top: 1.5rem;">🧪 A/B TESTING MATRIX</h3>
<div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
<table style="width: 100%; border-collapse: collapse;">
<tr style="background: #F3F4F6;">
<th style="border: 1px solid #E5E7EB; padding: 0.5rem;">Week</th>
<th style="border: 1px solid #E5E7EB; padding: 0.5rem;">Test Variable</th>
<th style="border: 1px solid #E5E7EB; padding: 0.5rem;">Variants</th>
<th style="border: 1px solid #E5E7EB; padding: 0.5rem;">Winner Action</th>
</tr>
<tr>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Week 1</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Hook Type</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Problem vs Contrarian vs Social Proof</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Promote winner 3x</td>
</tr>
<tr style="background: #F9FAFB;">
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Week 2</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Posting Time</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">8AM vs 1PM vs 7PM</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Lock in optimal time</td>
</tr>
<tr>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Week 3</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">CTA Type</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">DM vs Save vs Comment</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Scale winning CTA</td>
</tr>
<tr style="background: #F9FAFB;">
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Week 4</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Content Length</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">15s vs 30s vs 60s</td>
<td style="border: 1px solid #E5E7EB; padding: 0.5rem;">Optimize duration</td>
</tr>
</table>
</div>

<h3 style="color: #8B5CF6; margin-top: 1.5rem;">💰 CONVERSION FUNNEL</h3>
<div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
<p><strong>Stage 1: Awareness (Viral Content)</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Hook-driven Reels (10M+ reach target)</li>
<li>Controversial takes (high engagement)</li>
<li>CTA: "Follow for daily tips"</li>
</ul>

<p style="margin-top: 1rem;"><strong>Stage 2: Consideration (Authority Content)</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Case studies with metrics</li>
<li>Behind-the-scenes of results</li>
<li>CTA: "DM 'STRATEGY' for free guide"</li>
</ul>

<p style="margin-top: 1rem;"><strong>Stage 3: Conversion (Direct Offer)</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Limited-time offers</li>
<li>Testimonial compilations</li>
<li>CTA: "Link in bio - 24hr only"</li>
</ul>
</div>
</section>

<section class="strategy-section">
<h2>6. ANALYTICS DASHBOARD</h2>
<p><strong>Track Daily (Non-Negotiable):</strong></p>
<ul style="margin-left: 1.5rem;">
<li><strong>Engagement Rate:</strong> Target >15% (likes+comments+saves/followers)</li>
<li><strong>Reach Rate:</strong> Target >50% (reach/followers)</li>
<li><strong>Save Rate:</strong> Target >5% (saves/reach) - Highest signal</li>
<li><strong>Share Rate:</strong> Target >2% (shares/reach) - Viral indicator</li>
<li><strong>Profile Visit Rate:</strong> Target >10% (visits/reach)</li>
<li><strong>Follower Conversion:</strong> Target >3% (new followers/profile visits)</li>
</ul>

<p style="margin-top: 1rem;"><strong>Tools:</strong> Instagram Insights + Metricool + Google Sheets automation</p>
</section>

<section class="strategy-section">
<h2>7. PAID AMPLIFICATION</h2>
<p><strong>Month 2-3: $1,000-2,000 Ad Budget</strong></p>
<div style="background: #F3F4F6; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
<p><strong>Strategy:</strong></p>
<ol style="margin-left: 1.5rem;">
<li>Identify top 3 organic performers (>20% engagement)</li>
<li>Boost with $50-100 each</li>
<li>Target: Lookalike audience (1% of followers)</li>
<li>Objective: Reach + Engagement</li>
<li>Scale winners to $500+</li>
</ol>
<p style="margin-top: 0.5rem;"><strong>Expected ROI:</strong> $1 ad spend = 50-100 new followers (if content is proven)</p>
</div>
</section>

<section class="strategy-section">
<h2>8. INFLUENCER COLLABORATION</h2>
<p><strong>Target: 10-20 micro-influencers (10K-100K followers)</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Engagement rate >10%</li>
<li>Audience overlap >30%</li>
<li>Collaboration: Shoutout-for-shoutout or paid ($100-500)</li>
<li>Expected: 500-2000 new followers per collab</li>
</ul>
</section>

<section class="strategy-section">
<h2>9. CONTENT REPURPOSING</h2>
<p><strong>1 Viral Reel → 10 Content Pieces:</strong></p>
<ol style="margin-left: 1.5rem;">
<li>Original Reel on Instagram</li>
<li>Repost on TikTok</li>
<li>YouTube Shorts</li>
<li>LinkedIn carousel (screenshots)</li>
<li>Twitter thread</li>
<li>Email newsletter</li>
<li>Blog post (expanded)</li>
<li>Pinterest pin</li>
<li>Facebook post</li>
<li>Instagram Story highlights</li>
</ol>
</section>

<section class="strategy-section">
<h2>10. 90-DAY REVENUE ROADMAP</h2>
<div style="background: #F3E8FF; padding: 1rem; border-radius: 0.5rem;">
<p><strong>Month 1: Build + Test</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Post 7x/week, A/B test hooks</li>
<li>Goal: 10K followers, identify winning formula</li>
<li>Revenue: $0 (building audience)</li>
</ul>

<p style="margin-top: 1rem;"><strong>Month 2: Scale + Monetize</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Double down on winners, start ads ($500)</li>
<li>Launch digital product ($47-97)</li>
<li>Goal: 50K followers, $5K revenue</li>
</ul>

<p style="margin-top: 1rem;"><strong>Month 3: Optimize + Expand</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Scale ads ($1500), influencer collabs</li>
<li>Launch high-ticket offer ($497-997)</li>
<li>Goal: 100K followers, $50K revenue</li>
</ul>
</div>
</section>

<section class="strategy-section" style="background: #FEF3C7; padding: 1.5rem; border-radius: 1rem;">
<h2 style="color: #92400E;">⚠️ EXPERT REALITY CHECK</h2>
<p style="color: #065F46;"><strong>✅ This works if:</strong> You're data-obsessed, test relentlessly, and scale winners aggressively</p>
<p style="color: #991B1B; margin-top: 0.5rem;"><strong>❌ This fails if:</strong> You rely on "gut feel" instead of metrics, or give up before finding your viral formula</p>

<div style="margin-top: 1rem; background: white; padding: 1rem; border-radius: 0.5rem;">
<p style="font-weight: bold; color: #8B5CF6;">💡 EXPERT TIP:</p>
<p>Your first viral hit is luck. Your second is skill. Your third is a system. Build the system.</p>
</div>
</section>

</div>
"""

def generate_strategy_template(topic: str) -> str:
    """Generate 10-section strategy matching coffee format exactly"""
    # ... (Existing template function remains below)
    return f"""
<div class="strategy-sections">

<h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 2rem; color: #7C3AED;">
CONTENT STRATEGY FOR {topic.upper()}
</h1>

<section class="strategy-section">
<h2 style="font-size: 1.75rem; font-weight: bold; margin: 2rem 0 1rem; color: #1E3A8A;">
1. BUSINESS GOAL (Refined)
</h2>
<p><strong>Vague Goal:</strong> "Grow {topic} presence"</p>
<p><strong>SMART Goal:</strong> Generate 50,000 engaged followers and 500 qualified leads in 90 days through educational content and strategic offers.</p>
</section>

<section class="strategy-section">
<h2 style="font-size: 1.75rem; font-weight: bold; margin: 2rem 0 1rem; color: #1E3A8A;">
2. TARGET AUDIENCE (Narrowed Down)
</h2>
<p><strong>Primary Audience (70% focus):</strong> Health-conscious professionals aged 25-40</p>
<ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
<li>Active on Instagram 2-3 hours daily</li>
<li>Values convenience and quality</li>
<li>Willing to pay premium for results</li>
<li>Seeks expert guidance and community</li>
<li>Prefers visual, bite-sized content</li>
</ul>
<p><strong>Secondary Audience:</strong> Fitness enthusiasts and wellness advocates</p>
<p><strong>Recommendation:</strong> Focus 70% on primary audience for maximum conversion</p>
</section>

<section class="strategy-section">
<h2 style="font-size: 1.75rem; font-weight: bold; margin: 2rem 0 1rem; color: #1E3A8A;">
3. BRAND POSITIONING & UNIQUE ANGLE
</h2>
<p><strong>Positioning Options:</strong></p>
<ol style="margin-left: 1.5rem; margin-top: 0.5rem;">
<li><strong>The Expert:</strong> Science-backed, data-driven approach</li>
<li><strong>The Relatable Friend:</strong> Real results, real people</li>
<li><strong>The Premium Choice:</strong> Luxury experience, exclusive access</li>
<li><strong>The Community Builder:</strong> Supportive tribe, shared journey</li>
<li><strong>The Innovator:</strong> Cutting-edge methods, latest trends</li>
</ol>
<p><strong>Recommended:</strong> #2 - The Relatable Friend. Authenticity drives engagement and trust.</p>
</section>

<section class="strategy-section">
<h2 style="font-size: 1.75rem; font-weight: bold; margin: 2rem 0 1rem; color: #1E3A8A;">
4. CONTENT PILLARS (What You'll Actually Post)
</h2>

<div style="margin-top: 1rem;">
<h3 style="font-size: 1.25rem; font-weight: 600; color: #7C3AED;">Pillar 1: Educational/Value (30%)</h3>
<p><strong>5 Reel Examples:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>"5 Signs You Need This" - Problem awareness</li>
<li>"Common Mistakes to Avoid" - Expert tips</li>
<li>"How It Works in 60 Seconds" - Quick explainer</li>
<li>"Before You Start, Know This" - Prerequisites</li>
<li>"The Science Behind Results" - Credibility builder</li>
</ul>
</div>

<div style="margin-top: 1.5rem;">
<h3 style="font-size: 1.25rem; font-weight: 600; color: #7C3AED;">Pillar 2: Product/Offer (25%)</h3>
<p><strong>5 Reel Examples:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>"What's Included" - Feature showcase</li>
<li>"Real Results in 30 Days" - Testimonials</li>
<li>"Limited Time Offer" - Urgency creator</li>
<li>"How to Get Started" - CTA focused</li>
<li>"Why Choose Us" - Differentiation</li>
</ul>
</div>

<div style="margin-top: 1.5rem;">
<h3 style="font-size: 1.25rem; font-weight: 600; color: #7C3AED;">Pillar 3: Lifestyle/Relatable (30%)</h3>
<p><strong>5 Reel Examples:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>"Day in the Life" - Behind the scenes</li>
<li>"Relatable Struggles" - Humor + empathy</li>
<li>"Morning Routine" - Aspirational content</li>
<li>"Weekend Vibes" - Lifestyle integration</li>
<li>"Real Talk" - Authentic moments</li>
</ul>
</div>

<div style="margin-top: 1.5rem;">
<h3 style="font-size: 1.25rem; font-weight: 600; color: #7C3AED;">Pillar 4: Community/UGC (15%)</h3>
<p><strong>5 Reel Examples:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>"Customer Spotlight" - Success stories</li>
<li>"Q&A Friday" - Engagement driver</li>
<li>"Challenge Results" - Community wins</li>
<li>"Your Questions Answered" - Interactive</li>
<li>"Shoutout Saturday" - Recognition</li>
</ul>
</div>
</section>

<section class="strategy-section">
<h2 style="font-size: 1.75rem; font-weight: bold; margin: 2rem 0 1rem; color: #1E3A8A;">
5. CONTENT EXECUTION PLAN
</h2>
<p><strong>Posting Frequency:</strong> 5-7 Reels per week (1-2 daily)</p>
<p><strong>Best Posting Times:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>7-9 AM (Morning commute)</li>
<li>12-1 PM (Lunch break)</li>
<li>7-9 PM (Evening wind-down)</li>
</ul>
<p><strong>Reel Format:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Hook: First 3 seconds grab attention</li>
<li>Length: 15-30 seconds optimal</li>
<li>CTA: Clear next step (link in bio, comment, share)</li>
</ul>

<table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
<thead>
<tr style="background: #F3F4F6;">
<th style="border: 1px solid #E5E7EB; padding: 0.75rem;">Week</th>
<th style="border: 1px solid #E5E7EB; padding: 0.75rem;">Educational</th>
<th style="border: 1px solid #E5E7EB; padding: 0.75rem;">Product</th>
<th style="border: 1px solid #E5E7EB; padding: 0.75rem;">Lifestyle</th>
<th style="border: 1px solid #E5E7EB; padding: 0.75rem;">Community</th>
</tr>
</thead>
<tbody>
<tr>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">Week 1</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">2 posts</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">1 post</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">2 posts</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">1 post</td>
</tr>
<tr style="background: #F9FAFB;">
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">Week 2</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">2 posts</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">2 posts</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">2 posts</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">1 post</td>
</tr>
<tr>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">Week 3</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">2 posts</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">1 post</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">2 posts</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">1 post</td>
</tr>
<tr style="background: #F9FAFB;">
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">Week 4</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">2 posts</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">2 posts</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">2 posts</td>
<td style="border: 1px solid #E5E7EB; padding: 0.75rem;">1 post</td>
</tr>
</tbody>
</table>
</section>

<section class="strategy-section">
<h2 style="font-size: 1.75rem; font-weight: bold; margin: 2rem 0 1rem; color: #1E3A8A;">
6. CONVERSION STRATEGY
</h2>
<p><strong>Link in Bio:</strong> Linktree with 4 options</p>
<ul style="margin-left: 1.5rem;">
<li>Free Guide Download (lead magnet)</li>
<li>Book Consultation (high-intent)</li>
<li>Shop Products (direct sale)</li>
<li>Join Community (engagement)</li>
</ul>
<p><strong>Stories Integration:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Polls: "Which topic next?"</li>
<li>Countdowns: Launch announcements</li>
<li>Quizzes: "What's your type?"</li>
<li>Questions: Direct engagement</li>
</ul>
<p><strong>Instagram Offers:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>"Show this Reel for 15% off"</li>
<li>"Comment 'READY' for exclusive access"</li>
<li>"First 50 get bonus package"</li>
</ul>
</section>

<section class="strategy-section">
<h2 style="font-size: 1.75rem; font-weight: bold; margin: 2rem 0 1rem; color: #1E3A8A;">
7. HASHTAG STRATEGY
</h2>
<p><strong>Large (100k-1M followers):</strong></p>
<ul style="margin-left: 1.5rem;">
<li>#FitnessMotivation (1.2M)</li>
<li>#HealthyLifestyle (850K)</li>
<li>#WellnessJourney (600K)</li>
<li>#TransformationTuesday (500K)</li>
</ul>
<p><strong>Medium (10k-100k):</strong></p>
<ul style="margin-left: 1.5rem;">
<li>#FitnessCommunity (85K)</li>
<li>#HealthCoach (45K)</li>
<li>#WellnessWarrior (30K)</li>
<li>#MindBodySoul (25K)</li>
</ul>
<p><strong>Small/Niche (1k-10k):</strong></p>
<ul style="margin-left: 1.5rem;">
<li>#YourNiche2024 (5K)</li>
<li>#LocalFitness (3K)</li>
<li>#SpecificMethod (2K)</li>
<li>#CommunityName (1K)</li>
</ul>
<p><strong>Usage:</strong> 8-12 hashtags per post, mix all three sizes</p>
</section>

<section class="strategy-section">
<h2 style="font-size: 1.75rem; font-weight: bold; margin: 2rem 0 1rem; color: #1E3A8A;">
8. METRICS TO TRACK
</h2>
<p><strong>Weekly Metrics:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Follower growth rate</li>
<li>Engagement rate (likes + comments + saves)</li>
<li>Reach and impressions</li>
<li>Profile visits</li>
<li>Link clicks</li>
</ul>
<p><strong>Monthly Metrics:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Lead generation (email signups)</li>
<li>Conversion rate (leads to customers)</li>
<li>Revenue from Instagram</li>
<li>Top performing content types</li>
</ul>
<p><strong>Goal Benchmarks:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Month 1: 5,000 followers, 5% engagement</li>
<li>Month 2: 15,000 followers, 7% engagement</li>
<li>Month 3: 50,000 followers, 10% engagement</li>
<li>90 days: 500 qualified leads</li>
</ul>
</section>

<section class="strategy-section">
<h2 style="font-size: 1.75rem; font-weight: bold; margin: 2rem 0 1rem; color: #1E3A8A;">
9. CONTENT CREATION TIPS
</h2>
<p><strong>Equipment:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>iPhone/Android (no fancy camera needed)</li>
<li>Natural lighting (near windows)</li>
<li>Simple tripod ($20-30)</li>
<li>Wireless mic for audio ($50)</li>
</ul>
<p><strong>Editing Tools:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>CapCut (free, easy transitions)</li>
<li>InShot (text overlays)</li>
<li>Canva (thumbnails, graphics)</li>
</ul>
<p><strong>Batch Creation Workflow:</strong></p>
<ol style="margin-left: 1.5rem;">
<li>Film 10-15 Reels in one session</li>
<li>Edit in batches (2-3 hours)</li>
<li>Schedule with Later or Planoly</li>
<li>Engage daily (30 min morning + evening)</li>
</ol>
<p><strong>Competitor Spy Method:</strong></p>
<ul style="margin-left: 1.5rem;">
<li>Follow top 10 competitors</li>
<li>Save their best-performing Reels</li>
<li>Adapt (don't copy) their hooks and formats</li>
<li>Add your unique angle</li>
</ul>
</section>

<section class="strategy-section">
<h2 style="font-size: 1.75rem; font-weight: bold; margin: 2rem 0 1rem; color: #1E3A8A;">
10. 90-DAY ROADMAP
</h2>
<div style="margin-top: 1rem;">
<h3 style="font-size: 1.25rem; font-weight: 600; color: #7C3AED;">Month 1: Foundation</h3>
<ul style="margin-left: 1.5rem;">
<li>Set up profile optimization (bio, highlights, link)</li>
<li>Create first 30 Reels (batch filming)</li>
<li>Post 5-7x per week consistently</li>
<li>Engage 30 min daily (comments, DMs)</li>
<li>Goal: 5,000 followers, establish brand voice</li>
</ul>
</div>

<div style="margin-top: 1.5rem;">
<h3 style="font-size: 1.25rem; font-weight: 600; color: #7C3AED;">Month 2: Optimization</h3>
<ul style="margin-left: 1.5rem;">
<li>Analyze top 10 performing Reels</li>
<li>Double down on winning formats</li>
<li>Launch first paid offer/product</li>
<li>Run Instagram Stories ads ($200-500)</li>
<li>Goal: 15,000 followers, 100 leads</li>
</ul>
</div>

<div style="margin-top: 1.5rem;">
<h3 style="font-size: 1.25rem; font-weight: 600; color: #7C3AED;">Month 3: Scale</h3>
<ul style="margin-left: 1.5rem;">
<li>Collaborate with 5-10 micro-influencers</li>
<li>Launch UGC campaign (customer testimonials)</li>
<li>Increase ad spend to $1,000-2,000</li>
<li>Host live Q&A or workshop</li>
<li>Goal: 50,000 followers, 500 qualified leads</li>
</ul>
</div>
</section>

<section class="strategy-section" style="background: #FEF3C7; padding: 1.5rem; border-radius: 1rem; border-left: 4px solid #F59E0B;">
<h2 style="font-size: 1.75rem; font-weight: bold; margin-bottom: 1rem; color: #92400E;">
⚠️ FINAL REALITY CHECK
</h2>
<div style="margin-top: 1rem;">
<p style="font-weight: 600; color: #065F46; margin-bottom: 0.5rem;">✅ This works if:</p>
<ul style="margin-left: 1.5rem; color: #065F46;">
<li>You post consistently (5-7x per week minimum)</li>
<li>You engage authentically (not just auto-comments)</li>
<li>You track metrics weekly and adjust</li>
<li>You batch create content (don't wing it daily)</li>
<li>You have a clear offer/product to sell</li>
</ul>
</div>

<div style="margin-top: 1.5rem;">
<p style="font-weight: 600; color: #991B1B; margin-bottom: 0.5rem;">❌ This fails if:</p>
<ul style="margin-left: 1.5rem; color: #991B1B;">
<li>You post sporadically (2-3x per week)</li>
<li>You only promote, never provide value</li>
<li>You ignore comments and DMs</li>
<li>You don't analyze what's working</li>
<li>You give up before 90 days</li>
</ul>
</div>
</section>

</div>
"""


def generate_coffee_format_strategy(topic: str) -> str:
    """Generate strategy using CrewAI agents (if enabled)"""
    # This would use CrewAI to generate content
    # For now, fall back to template
    return generate_strategy_template(topic)


# ============================================================================
# STRATEGY GENERATION
# ============================================================================


@app.post("/api/strategy")
async def generate_strategy(
    strategy_input: StrategyInput,
    current_user: dict = Depends(get_current_user)
):
    # Rate limiting
    if not check_rate_limit(current_user["id"]):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    # Check cache
    cache_key = generate_cache_key(strategy_input)
    cached_strategy = get_cached_strategy(cache_key)
    
    if cached_strategy:
        return {
            "success": True,
            "strategy": cached_strategy,
            "cached": True,
            "generation_time": 0.0,
            "message": "Strategy retrieved from cache"
        }
    
    # Generate strategy
    start_time = time.time()
    
    if CREW_AI_ENABLED:
        try:
            strategy_dict = create_content_strategy_crew(strategy_input)
            message = "Strategy generated successfully"
        except Exception as e:
            strategy_dict = generate_demo_strategy(strategy_input)
            message = f"⚠️ CrewAI error, using demo: {str(e)}"
    else:
        strategy_dict = generate_demo_strategy(strategy_input)
        message = "⚠️ DEMO MODE: Add GROQ_API_KEY to .env for AI generation"
    
    generation_time = time.time() - start_time
    
    # Cache result
    set_cached_strategy(cache_key, strategy_dict)
    
    # Save to MongoDB
    strategy_doc = {
        "user_id": current_user["id"],
        "goal": strategy_input.goal,
        "audience": strategy_input.audience,
        "industry": strategy_input.industry,
        "platform": strategy_input.platform,
        "output_data": strategy_dict,
        "cache_key": cache_key,
        "generation_time": int(generation_time),
        "created_at": datetime.now(timezone.utc)
    }
    strategies_collection.insert_one(strategy_doc)
    
    # Increment usage count
    if REDIS_ENABLED:
        try:
            current_month = datetime.now().strftime("%Y-%m")
            count_key = f"strategy_count:{current_user['id']}:{current_month}"
            
            # Get current or 0
            current_val = redis_client.get(count_key)
            new_count = int(current_val) + 1 if current_val else 1
            
            # Set with 24h expiry (rolling)
            redis_client.setex(count_key, 86400, new_count)
            print(f"📈 Usage incremented for {current_user['id']}: {new_count}/3")
        except Exception as e:
            print(f"⚠️ Failed to increment usage: {e}")
    
    return {
        "success": True,
        "strategy": strategy_dict,
        "cached": False,
        "generation_time": generation_time,
        "message": message
    }

@app.get("/api/history")
async def get_history(current_user: dict = Depends(get_current_user), limit: int = 20):
    strategies = list(strategies_collection.find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1).limit(limit))
    
    history_items = []
    for s in strategies:
        history_items.append({
            "id": str(s["_id"]),
            "goal": s["goal"],
            "audience": s["audience"],
            "industry": s["industry"],
            "platform": s["platform"],
            "created_at": s["created_at"],
            "generation_time": s.get("generation_time")
        })
    
    return {
        "success": True,
        "strategies": history_items,
        "total": len(history_items)
    }

@app.get("/api/strategy/{strategy_id}")
async def get_strategy_by_id(strategy_id: str, current_user: dict = Depends(get_current_user)):
    try:
        strategy = strategies_collection.find_one({
            "_id": ObjectId(strategy_id),
            "user_id": current_user["id"]
        })
    except:
        raise HTTPException(status_code=404, detail="Invalid strategy ID")
    
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    return {
        "success": True,
        "strategy": strategy["output_data"],
        "input": {
            "goal": strategy["goal"],
            "audience": strategy["audience"],
            "industry": strategy["industry"],
            "platform": strategy["platform"]
        },
        "created_at": strategy["created_at"],
        "generation_time": strategy.get("generation_time")
    }

@app.delete("/api/strategy/{strategy_id}")
async def delete_strategy(strategy_id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = strategies_collection.delete_one({
            "_id": ObjectId(strategy_id),
            "user_id": current_user["id"]
        })
    except:
        raise HTTPException(status_code=404, detail="Invalid strategy ID")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    # CRITICAL FIX: Full reset of rate limit counter on delete
    if REDIS_ENABLED:
        try:
            current_month = datetime.now().strftime("%Y-%m")
            cache_key = f"strategy_count:{current_user['id']}:{current_month}"
            
            # RESET TO ZERO (explicitly)
            redis_client.delete(cache_key)
            redis_client.setex(cache_key, 86400, 0)
            
            print(f"✅ FULL RESET: User {current_user['id']} → 0/3 strategies used")
        except Exception as e:
            print(f"⚠️ Failed to reset rate limit: {str(e)}")
    
    return {
        "success": True, 
        "message": "Strategy deleted - 3/3 strategies available",
        "status": "0/3 used"
    }


# ============================================================================
# RAZORPAY WEBHOOK - Automatic Pro Tier Upgrade
# ============================================================================

@app.post("/api/razorpay/webhook")
async def razorpay_webhook(request: Request):
    """Handle Razorpay webhook events for subscription management"""
    if not RAZORPAY_ENABLED:
        raise HTTPException(status_code=503, detail="Razorpay not configured")
    
    payload = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")
    
    # Verify webhook signature
    try:
        razorpay_client.utility.verify_webhook_signature(
            payload.decode(), 
            signature, 
            RAZORPAY_WEBHOOK_SECRET
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Parse event
    import json
    event = json.loads(payload)
    
    # Handle subscription.activated
    if event['event'] == 'subscription.activated':
        notes = event['payload']['subscription']['entity']['notes']
        user_id = notes.get('user_id')
        
        if user_id:
            # Upgrade user to Pro tier
            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {
                    "tier": "pro",
                    "razorpay_subscription_id": event['payload']['subscription']['entity']['id']
                }}
            )
            print(f"✅ User {user_id} upgraded to Pro via Razorpay")
    
    # Handle subscription.cancelled
    elif event['event'] == 'subscription.cancelled':
        notes = event['payload']['subscription']['entity']['notes']
        user_id = notes.get('user_id')
        
        if user_id:
            # Downgrade user to free tier
            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"tier": "free"}}
            )
            print(f"⚠️ User {user_id} downgraded to Free (subscription cancelled)")
    
    return {"status": "success"}


# ============================================================================
# REFERRAL SYSTEM - Viral Growth ($5K/mo potential)
# ============================================================================

class ReferralCodeInput(BaseModel):
    referral_code: str = Field(..., min_length=6, max_length=10)

@app.post("/api/referral/apply")
async def apply_referral(
    referral_input: ReferralCodeInput,
    current_user: dict = Depends(get_current_user)
):
    """
    Apply referral code - Gives referring user 7 days free Pro
    Viral loop: User shares code → Friend signs up → Both get benefits
    """
    
    # Check if referral code exists
    referrer = users_collection.find_one({"referral_code": referral_input.referral_code})
    
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    
    # Can't refer yourself
    if str(referrer["_id"]) == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot use your own referral code")
    
    # Check if already used a referral
    current_user_doc = users_collection.find_one({"_id": ObjectId(current_user["id"])})
    if current_user_doc.get("referred_by"):
        raise HTTPException(status_code=400, detail="Referral code already applied")
    
    # REWARD REFERRER: 7 days free Pro
    users_collection.update_one(
        {"_id": referrer["_id"]},
        {
            "$set": {
                "tier": "pro",
                "pro_until": datetime.now(timezone.utc) + timedelta(days=7),
                "updated_at": datetime.now(timezone.utc)
            },
            "$inc": {"referral_count": 1}
        }
    )
    
    # Mark new user as referred
    users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {
            "referred_by": str(referrer["_id"]),
            "referred_at": datetime.now(timezone.utc)
        }}
    )
    
    return {
        "success": True,
        "message": f"🎉 Referral applied! You and {referrer.get('email', 'the referrer')} both get bonuses!"
    }


@app.get("/api/referral/code")
async def get_referral_code(current_user: dict = Depends(get_current_user)):
    """
    Get user's unique referral code (generate if doesn't exist)
    """
    user_doc = users_collection.find_one({"_id": ObjectId(current_user["id"])})
    
    # Generate referral code if doesn't exist
    if not user_doc.get("referral_code"):
        import secrets
        referral_code = secrets.token_urlsafe(6).upper().replace("-", "").replace("_", "")[:8]
        
        users_collection.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$set": {"referral_code": referral_code}}
        )
    else:
        referral_code = user_doc["referral_code"]
    
    referral_count = user_doc.get("referral_count", 0)
    
    return {
        "referral_code": referral_code,
        "referral_count": referral_count,
        "share_url": f"https://stratify.ai/signup?ref={referral_code}",
        "message": "Share this link to earn free Pro access!"
    }


# ============================================================================
# PROFILE ENDPOINTS
# ============================================================================

@app.get("/api/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile information including usage stats"""
    user_id = current_user["id"]
    
    # Count total strategies
    total_strategies = strategies_collection.count_documents({"user_id": user_id})
    
    # Count strategies for this month (calendar month)
    now = datetime.now(timezone.utc)
    start_of_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    usage_month = strategies_collection.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": start_of_month}
    })
    
    return {
        "name": current_user.get("name", current_user["email"].split("@")[0]),
        "email": current_user["email"],
        "tier": current_user.get("tier", "free"),
        "usage_month": usage_month,
        "total_strategies": total_strategies,
        "photo": current_user.get("photo", None)
    }

@app.put("/api/profile")
async def update_profile(data: dict, current_user: dict = Depends(get_current_user)):
    """Update user profile information"""
    update_fields = {}
    if "name" in data:
        update_fields["name"] = data["name"]
    if "photo" in data:
        update_fields["photo"] = data["photo"]
    
    if not update_fields:
        return {"success": False, "message": "No fields to update"}
        
    users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": update_fields}
    )
    
    return {"success": True, "message": "Profile updated successfully"}


# ============================================================================
# FEEDBACK ENDPOINT (VenturusAI Response)
# ============================================================================

@app.post("/feedback")
async def submit_feedback(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Submit feedback (thumbs up/down) on a strategy"""
    try:
        # Verify token
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get feedback data
        data = await request.json()
        strategy_id = data.get("strategy_id")
        rating = data.get("rating")  # "up" or "down"
        comment = data.get("comment", "")
        
        # Update strategy with feedback
        strategies_collection.update_one(
            {"_id": ObjectId(strategy_id), "user_id": user_id},
            {
                "$set": {
                    "feedback_rating": rating,
                    "feedback_comment": comment,
                    "feedback_date": datetime.now(timezone.utc)
                }
            }
        )
        
        return {
            "success": True,
            "message": "Feedback submitted successfully"
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"❌ Feedback error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
