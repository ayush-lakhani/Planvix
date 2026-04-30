"""
Simplified main.py for TESTING without CrewAI (demo mode)
Add your GROQ_API_KEY to .env to enable full CrewAI functionality
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
import os

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")  # Use SQLite for testing
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "test-secret-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Database
Base = declarative_base()
engine = create_engine(DATABASE_URL.replace("postgresql://", "sqlite:///./"))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    tier = Column(String(50), default="free")
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# Pydantic schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str

class StrategyInput(BaseModel):
    goal: str
    audience: str
    industry: str
    platform: str

# FastAPI app
app = FastAPI(title="AI Content Strategy Planner - Demo Mode")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.get("/")
async def root():
    return {"message": "AI Content Strategy Planner API - Demo Mode", "status": "operational"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "operational",
        "mode": "demo",
        "message": "Add GROQ_API_KEY to .env for full functionality",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/auth/signup", response_model=Token)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(email=user_data.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.id})
    return Token(access_token=access_token, user_id=new_user.id, email=new_user.email)

@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, user_id=user.id, email=user.email)

@app.get("/api/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "tier": current_user.tier,
        "created_at": current_user.created_at
    }

@app.post("/api/strategy")
async def generate_strategy(
    strategy_input: StrategyInput,
    current_user: User = Depends(get_current_user)
):
    """
    DEMO MODE: Returns sample strategy data
    To enable real AI generation, add GROQ_API_KEY to backend/.env
    """
    
    # Sample strategy for demo
    demo_strategy = {
        "persona": {
            "name": f"{strategy_input.audience.title()} Enthusiast",
            "age_range": "25-34",
            "occupation": "Working Professional",
            "pain_points": [
                "Limited time for content creation",
                "Struggling with consistent posting",
                "Unsure about what content resonates",
                "Overwhelmed by algorithm changes",
                "Difficulty measuring ROI"
            ],
            "desires": [
                "Grow audience authentically",
                "Create engaging content easily",
                "Build a strong personal brand",
                "Monetize their expertise",
                "Save time on content planning"
            ],
            "objections": [
                "Too expensive",
                "Not sure if it works",
                "Already tried other tools",
                "Don't have time to learn",
                "Worried about AI-generated content quality"
            ],
            "daily_habits": [
                f"Checks {strategy_input.platform} multiple times daily",
                "Consumes industry content during commute",
                "Engages with posts in evening",
                "Plans content on weekends",
                "Follows trending topics"
            ],
            "content_preferences": [
                "Short-form video",
                "Quick tips and hacks",
                "Behind-the-scenes content",
                "User-generated content",
                "Data-driven insights"
            ]
        },
        "competitor_gaps": [
            {
                "gap": "Lack of personalized content strategies",
                "impact": "High",
                "implementation": "Create AI-powered personalization engine"
            },
            {
                "gap": "No real-time trend integration",
                "impact": "High",
                "implementation": "Build trend monitoring and alerts"
            },
            {
                "gap": "Missing analytics dashboard",
                "impact": "Medium",
                "implementation": "Add comprehensive performance tracking"
            },
            {
                "gap": "Limited platform-specific insights",
                "impact": "Medium",
                "implementation": "Platform-optimized content suggestions"
            },
            {
                "gap": "No collaboration features",
                "impact": "Low",
                "implementation": "Add team collaboration tools"
            }
        ],
        "keywords": [
            {"term": f"{strategy_input.industry.lower()} content ideas", "intent": "Informational", "difficulty": "Easy", "monthly_searches": "5K-10K", "priority": 10},
            {"term": f"how to grow on {strategy_input.platform.lower()}", "intent": "Informational", "difficulty": "Easy", "monthly_searches": "10K-50K", "priority": 9},
            {"term": f"{strategy_input.goal.lower()}", "intent": "Transactional", "difficulty": "Medium", "monthly_searches": "1K-5K", "priority": 8},
            {"term": f"{strategy_input.platform.lower()} marketing tips", "intent": "Informational", "difficulty": "Easy", "monthly_searches": "5K-10K", "priority": 8},
            {"term": f"best time to post on {strategy_input.platform.lower()}", "intent": "Informational", "difficulty": "Easy", "monthly_searches": "5K-10K", "priority": 7},
            {"term": f"{strategy_input.industry.lower()} niche ideas", "intent": "Informational", "difficulty": "Medium", "monthly_searches": "1K-5K", "priority": 7},
            {"term": f"viral {strategy_input.platform.lower()} content", "intent": "Informational", "difficulty": "Medium", "monthly_searches": "5K-10K", "priority ": 6},
            {"term": f"{strategy_input.audience.lower()} engagement", "intent": "Informational", "difficulty": "Easy", "monthly_searches": "1K-5K", "priority": 6},
            {"term": f"content calendar {strategy_input.industry.lower()}", "intent": "Transactional", "difficulty": "Easy", "monthly_searches": "1K-5K", "priority": 5},
            {"term": f"{strategy_input.platform.lower()} algorithm 2024", "intent": "Informational", "difficulty": "Medium", "monthly_searches": "5K-10K", "priority": 5}
        ],
        "calendar": [
            {"week": 1, "day": 1, "topic": "Introduction & Value Proposition", "format": "Reel", "caption_hook": "Here's why you'll love this...", "cta": "Follow for more tips"},
            {"week": 1, "day": 3, "topic": "Quick Win #1", "format": "Carousel", "caption_hook": "Want results fast? Try this...", "cta": "Save this for later"},
            {"week": 1, "day": 5, "topic": "Behind the Scenes", "format": "Story", "caption_hook": "Never shown this before...", "cta": "Reply with your thoughts"},
            {"week": 2, "day": 2, "topic": "Educational Content", "format": "Post", "caption_hook": "Did you know...", "cta": "Share with someone who needs this"},
            {"week": 2, "day": 4, "topic": "User Success Story", "format": "Reel", "caption_hook": "This is incredible...", "cta": "What's your story?"},
            {"week": 2, "day": 6, "topic": "Common Mistake", "format": "Carousel", "caption_hook": "Stop doing this...", "cta": "Tag someone who needs to see this"},
            {"week": 3, "day": 1, "topic": "Trend Integration", "format": "Reel", "caption_hook": "Everyone's talking about...", "cta": "Follow for daily insights"},
            {"week": 3, "day": 3, "topic": "Expert Tip", "format": "Post", "caption_hook": "After 5 years I learned...", "cta": "Save this tip"},
            {"week": 3, "day": 5, "topic": "Q&A Session", "format": "Story", "caption_hook": "You asked, I'm answering...", "cta": "Ask me anything"},
            {"week": 4, "day": 2, "topic": "Value Packed Tutorial", "format": "Carousel", "caption_hook": "Here's the exact process...", "cta": "Save for when you need it"},
            {"week": 4, "day": 4, "topic": "Motivational Content", "format": "Reel", "caption_hook": "Remember this...", "cta": "Share to inspire others"},
            {"week": 4, "day": 6, "topic": "Month Recap & Preview", "format": "Post", "caption_hook": "Can't believe this month...", "cta": "What do you want next month?"}
        ],
        "sample_posts": [
            {
                "title": "🚀 Game-Changing Content Strategy",
                "caption": f"If you're in {strategy_input.industry}, listen up.\n\nI spent months trying to crack {strategy_input.platform}, and here's what finally worked:\n\n✅ Consistent posting schedule\n✅ Authentic storytelling\n✅ Value-first approach\n\nThe result? 3x engagement in 30 days.\n\nWant the full strategy? Comment 'STRATEGY' below 👇",
                "hashtags": ["#" + strategy_input.industry.replace(" ", "").replace("&", ""), f"#{strategy_input.platform}Marketing", "#ContentStrategy", "#GrowthHacking", "#DigitalMarketing", "#SocialMediaTips", "#ContentCreator"],
                "image_prompt": f"Professional, modern workspace with laptop showing {strategy_input.platform} dashboard, vibrant colors, success metrics visible, inspiring atmosphere",
                "best_time": "Weekdays 9-11 AM or 7-9 PM"
            },
            {
                "title": "💡 The One Thing That Changed Everything",
                "caption": f"After working with {strategy_input.audience}, I discovered this...\n\nMost people overcomplicate content.\n\nHere's the simple formula that works:\n1. Identify one core problem\n2. Provide one clear solution\n3. Add one specific call-to-action\n\nThat's it. No fancy editing. No viral hacks.\n\nJust pure value.\n\nDouble tap if this makes sense ❤️",
                "hashtags": ["#SimplifySuccess", f"#{strategy_input.platform}Tips", "#ContentMarketing", "#EntrepreneurLife", "#GrowthMindset", "#SocialMediaStrategy", "#MarketingTips"],
                "image_prompt": "Clean minimalist design with the 3-step formula highlighted, professional aesthetic, easy to read text overlay",
                "best_time": "Weekdays 12-2 PM"
            },
            {
                "title": "🔥 Biggest Mistakes I See Everyone Making",
                "caption": f"Working with {strategy_input.audience} in {strategy_input.industry}, I see these mistakes DAILY:\n\n❌ Posting without a strategy\n❌ Ignoring analytics\n❌ Copying others instead of finding your voice\n❌ Expecting overnight results\n❌ Not engaging with your community\n\nSound familiar?\n\nThe good news? All fixable.\n\nWhich one are you guilty of? (No judgment! 😊)\n\nComment the number below 👇",
                "hashtags": ["#MarketingMistakes", f"#{strategy_input.industry}Tips", "#SocialMediaStrategy", "#ContentCreation", "#DigitalMarketing", "#OnlineMarketing", "#BusinessGrowth"],
                "image_prompt": "Eye-catching red and black design with X marks, professional but attention-grabbing, list format visible",
                "best_time": "Weekdays 6-8 PM or Weekends 10 AM-12 PM"
            }
        ]
    }
    
    return {
        "success": True,
        "strategy": demo_strategy,
        "cached": False,
        "generation_time": 0.5,
        "message": "⚠️ DEMO MODE: This is sample data. Add GROQ_API_KEY to .env for real AI-generated strategies!"
    }

@app.get("/api/history")
async def get_history(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "strategies": [],
        "total": 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
