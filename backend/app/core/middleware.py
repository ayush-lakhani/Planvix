import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from jose import jwt, JWTError
from app.core.logger import request_id_var, logger
from app.core.config import settings

class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        # Set the request ID in context variable for logging
        token = request_id_var.set(request_id)
        
        # Attach to request state so routes can access it if needed
        request.state.request_id = request_id
        
        response = await call_next(request)
        
        # Inject into response headers
        response.headers["X-Request-ID"] = request_id
        
        # Reset context variable
        request_id_var.reset(token)
        
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

class UserStateMiddleware(BaseHTTPMiddleware):
    """
    Middleware to optionally attach user info to request state from JWT.
    Used for rate limiting by user tier even before dependency injection.
    """
    async def dispatch(self, request: Request, call_next):
        request.state.user_id = None
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
                request.state.user_id = payload.get("user_id") or payload.get("sub")
                request.state.user_tier = payload.get("tier", "free")
            except Exception:
                # Silently fail, dependencies will handle invalid tokens
                pass
                
        return await call_next(request)
