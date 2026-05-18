import uuid
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from jose import jwt, JWTError
from app.core.logger import request_id_var, user_id_var, user_tier_var, logger, log_event
from app.core.config import settings

class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Injects a unique correlation ID into every request context.
    """
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        token = request_id_var.set(request_id)
        request.state.request_id = request_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        request_id_var.reset(token)
        return response

class TimingMiddleware(BaseHTTPMiddleware):
    """
    Tracks request execution time for performance observability.
    """
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        response = await call_next(request)
        process_time = time.perf_counter() - start_time
        response.headers["X-Process-Time"] = f"{process_time:.4f}"
        
        # Log slow requests (> 2s for standard endpoints, AI ones expected to be slow)
        if process_time > 2.0 and not request.url.path.startswith("/strategy"):
            logger.warning(f"⚠️ Slow request detected: {request.method} {request.url.path} ({process_time:.2f}s)")
            
        return response

class ObservabilityMiddleware(BaseHTTPMiddleware):
    """
    Logs all incoming requests and outgoing responses in a structured format.
    """
    async def dispatch(self, request: Request, call_next):
        method = request.method
        path = request.url.path
        
        # Pre-log request
        log_event("http_request", {
            "method": method,
            "path": path,
            "client_ip": request.client.host if request.client else "unknown"
        })
        
        response = await call_next(request)
        
        # Post-log response
        log_event("http_response", {
            "method": method,
            "path": path,
            "status_code": response.status_code
        })
        
        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ws: wss:;"
        return response

class UserStateMiddleware(BaseHTTPMiddleware):
    """
    Establish user identity context from JWT for enterprise tracing.
    """
    async def dispatch(self, request: Request, call_next):
        request.state.user_id = "anonymous"
        request.state.user_tier = "free"
        
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                token = auth_header.split(" ")[1]
                payload = jwt.decode(
                    token, 
                    settings.SECRET_KEY, 
                    algorithms=[settings.ALGORITHM],
                    issuer=settings.JWT_ISSUER,
                    audience=settings.JWT_AUDIENCE
                )
                user_id = payload.get("user_id") or payload.get("sub") or "anonymous"
                request.state.user_id = user_id
                request.state.user_tier = payload.get("tier", "free")
                
                # Set in context variable for logging and rate limiting
                user_token = user_id_var.set(user_id)
                tier_token = user_tier_var.set(request.state.user_tier)
                try:
                    response = await call_next(request)
                finally:
                    user_id_var.reset(user_token)
                    user_tier_var.reset(tier_token)
                return response
                
            except Exception:
                pass
                
        # For anonymous users, still set the default tier in context
        tier_token = user_tier_var.set(request.state.user_tier)
        try:
            return await call_next(request)
        finally:
            user_tier_var.reset(tier_token)
