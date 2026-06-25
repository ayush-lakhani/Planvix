import os
from dotenv import load_dotenv  # type: ignore


load_dotenv()

class Settings:
    PROJECT_NAME: str = "planvIx"
    VERSION: str = "2.0.0-production"
    ENV: str = os.getenv("ENV", "development")
    
    # Database
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
    DB_NAME: str = "content_planner"
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Security
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")

    if not SECRET_KEY:
        raise RuntimeError("CRITICAL ERROR: JWT_SECRET_KEY environment variable is missing!")
    
    if not os.getenv("GROQ_API_KEY"):
        # We don't raise RuntimeError here but we'll log a warning in startup if needed
        pass
        
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_ISSUER: str = os.getenv("JWT_ISSUER", "planvix.com")
    JWT_AUDIENCE: str = os.getenv("JWT_AUDIENCE", "planvix-clients")
    
    # Admin
    ADMIN_SECRET: str = os.getenv("ADMIN_SECRET", "planvix-admin-2026-change-now")
    
    # AI & API Keys
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    SERPAPI_KEY: str = os.getenv("SERPAPI_KEY", "")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    
    # Payments
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "")
    RAZORPAY_PLAN_ID: str = os.getenv("RAZORPAY_PLAN_ID", "")
    RAZORPAY_WEBHOOK_SECRET: str = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))
    RATE_LIMIT_SIGNUP: str = os.getenv("RATE_LIMIT_SIGNUP", "5/minute")
    RATE_LIMIT_LOGIN: str = os.getenv("RATE_LIMIT_LOGIN", "5/minute")
    RATE_LIMIT_REFRESH: str = os.getenv("RATE_LIMIT_REFRESH", "10/minute")
    RATE_LIMIT_GOOGLE: str = os.getenv("RATE_LIMIT_GOOGLE", "10/minute")
    RATE_LIMIT_AI: str = os.getenv("RATE_LIMIT_AI", "2/minute")
    RATE_LIMIT_USER_FREE: str = os.getenv("RATE_LIMIT_USER_FREE", "30/minute")
    RATE_LIMIT_USER_PRO: str = os.getenv("RATE_LIMIT_USER_PRO", "100/minute")
    RATE_LIMIT_API_KEY: str = os.getenv("RATE_LIMIT_API_KEY", "200/minute")
    RATE_LIMIT_IP: str = os.getenv("RATE_LIMIT_IP", "30/minute")

    # Redis Feature Flags
    REDIS_FALLBACK_ENABLED: bool = os.getenv("REDIS_FALLBACK_ENABLED", "True").lower() in ("true", "1", "yes")
    REDIS_AUTO_RECOVERY: bool = os.getenv("REDIS_AUTO_RECOVERY", "True").lower() in ("true", "1", "yes")

    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

settings = Settings()

def validate_environment():
    import sys
    critical_missing = []
    if not settings.SECRET_KEY:
        critical_missing.append("JWT_SECRET_KEY")
    if not settings.MONGODB_URL:
        critical_missing.append("MONGODB_URL")
        
    if critical_missing:
        error_msg = f"FATAL CONFIGURATION ERROR: Missing required environment variables: {', '.join(critical_missing)}. Application cannot start."
        # Print directly and flush to make sure it is visible in console
        print(error_msg, file=sys.stderr, flush=True)
        sys.exit(1)

