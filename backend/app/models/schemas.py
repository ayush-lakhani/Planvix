"""
Data models and schemas for the Content Strategy Planner
Includes both Pydantic models (for API validation)
"""

from datetime import datetime
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, EmailStr, Field

# ============================================================================
# PYDANTIC MODELS (API Request/Response Schemas)
# ============================================================================

class StrategyInput(BaseModel):
    """Input schema for strategy generation"""
    goal: str = Field(..., min_length=10, max_length=500, description="Business goal")
    audience: str = Field(..., min_length=5, max_length=200, description="Target audience")
    industry: str = Field(..., min_length=3, max_length=100, description="Industry")
    platform: str = Field(..., min_length=3, max_length=50, description="Primary platform")
    contentType: str = Field(default="Mixed Content", max_length=50, description="Content format")
    experience: str = Field(default="beginner", max_length=50, description="Experience level")
    strategy_mode: str = Field(default="conservative", pattern="^(conservative|aggressive)$", description="Risk/Innovation level")
    brand_name: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "goal": "Sell premium coffee subscriptions to remote workers",
                "audience": "Remote tech workers aged 25-35",
                "industry": "F&B",
                "platform": "Instagram",
                "contentType": "Reels",
                "strategy_mode": "aggressive"
            }
        }

# --- Nested Models for ContentStrategy ---

class StrategyMetadata(BaseModel):
    generated_at: str
    difficulty_score: int
    confidence_score: int
    growth_velocity_score: int
    token_usage: Optional[int] = 0
    generation_time: float
    message: str = "Strategy generated successfully"

class StrategicOverview(BaseModel):
    growth_objective: str
    target_persona_snapshot: str
    positioning_angle: str
    competitive_edge: str

class SamplePostContent(BaseModel):
    format: str
    hook: str
    hook_psychology: str # WHY the hook works
    script_or_structure: str
    caption: str
    cta: str
    cta_placement: str # e.g. "middle of reel"
    visual_storytelling: str # Recommended visuals
    pacing_recommendation: str # e.g. "fast cuts"
    emotional_trigger: str # e.g. "FOMO", "Empowerment"
    image_prompt: Optional[str] = None

class ContentPillar(BaseModel):
    pillar_name: str
    why_it_works: str
    strategic_reasoning: str # Behavioral insight
    funnel_stage: str # Awareness, Education, Trust, Authority, Conversion, Retention, Advocacy
    content_objective: str
    virality_angle: str
    sample_posts: List[SamplePostContent]

class KeywordInsight(BaseModel):
    keyword: str
    intent: str # Informational, Commercial, Navigational, Transactional
    competition: str # Low/Med/High
    opportunity_score: int # 1-100
    conversion_potential: str

class KeywordStats(BaseModel):
    primary: List[KeywordInsight]
    long_tail: List[KeywordInsight]
    hashtags: List[str]
    discovery_hypothesis: str # WHY these will work

class ROIStats(BaseModel):
    traffic_lift_percentage: str
    engagement_boost_percentage: str
    confidence_score: int # 1-100
    confidence_reasoning: str
    predicted_engagement_tier: str # e.g. "Top 10% for niche"

class CalendarEntry(BaseModel):
    day: int
    format: str
    theme: str
    funnel_stage: str
    narrative_goal: str # e.g. "Bridge from pain to solution"
    
class ContentStrategy(BaseModel):
    """Complete content strategy output - EVOLVED 5-AGENT SCHEMA"""
    metadata: StrategyMetadata
    strategic_overview: StrategicOverview
    growth_intelligence: Dict[str, Any] # Competitor/Trend insights
    strategic_narrative: str # Campaign-level storytelling
    content_pillars: List[ContentPillar]
    content_calendar: List[CalendarEntry]
    keywords: KeywordStats
    roi_prediction: ROIStats

class StrategyResponse(BaseModel):
    """API response wrapper"""
    success: bool
    strategy: ContentStrategy
    cached: bool = False
    generation_time: float
    message: str = "Strategy generated successfully"
    tokens_used_month: Optional[int] = 0
    next_billing_date: Optional[str] = None

class FeedbackRequest(BaseModel):
    """Schema for strategy feedback"""
    strategy_id: str
    rating: int = Field(..., ge=1, le=5)

# ============================================================================
# AUTHENTICATION MODELS
# ============================================================================

class UserCreate(BaseModel):
    """User registration schema"""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)

class UserLogin(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str

class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    role: str
    tier: str

class GoogleAuthRequest(BaseModel):
    """Google OAuth access token from implicit flow"""
    access_token: str

class UserResponse(BaseModel):
    """User data response"""
    id: str
    email: str
    tier: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ============================================================================
# HISTORY RESPONSE
# ============================================================================

class StrategyHistoryItem(BaseModel):
    """Single history item"""
    id: str
    goal: str
    audience: str
    industry: str
    platform: str
    created_at: Optional[datetime] = None
    generation_time: Optional[int] = None

    class Config:
        from_attributes = True

class HistoryResponse(BaseModel):
    """List of user's past strategies"""
    success: bool
    strategies: List[StrategyHistoryItem]
    total: int

# ============================================================================
# DASHBOARD & PROFILE SCHEMAS
# ============================================================================

class AnalyticsDataPoint(BaseModel):
    date: str
    count: int

class TokenUsagePoint(BaseModel):
    date: str
    tokens: int

class GrowthTrendPoint(BaseModel):
    month: str
    value: int

class ProfileAnalyticsResponse(BaseModel):
    monthly_strategies: List[AnalyticsDataPoint]
    token_usage: List[TokenUsagePoint]
    growth_trend: List[GrowthTrendPoint]

class ActivityItem(BaseModel):
    type: str
    timestamp: Optional[datetime] = None
    title: str

class BillingResponse(BaseModel):
    plan: str
    monthly_limit: int
    used_this_month: int
    renewal_date: Optional[str] = None

class ProfileHeroResponse(BaseModel):
    name: str
    email: str
    tier: str
    member_since: Optional[datetime] = None
    total_strategies: int
    tokens_used_month: int
    next_billing_date: Optional[str] = None
