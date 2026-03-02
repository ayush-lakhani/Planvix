from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from app.models.schemas import UserCreate, UserLogin, Token
from app.services.auth_service import auth_service
from app.core.rate_limit import limiter
import asyncio

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/signup", response_model=Token)
@limiter.limit("5/minute")
async def signup(request: Request, response: Response, user_data: UserCreate):
    result = await auth_service.signup(user_data)
    
    refresh_token = result.pop("refresh_token")
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True, 
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )
    
    try:
        from app.websocket.activity_socket import broadcast_event
        asyncio.create_task(broadcast_event("user_signup", {
            "details": f"New user registered: {user_data.email}",
            "email": user_data.email,
            "user_id": result["user_id"],
        }))
    except Exception:
        pass

    return result

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, response: Response, user_data: UserLogin):
    result = await auth_service.login(user_data)
    
    refresh_token = result.pop("refresh_token")
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True, 
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )
    return result

@router.post("/refresh", response_model=Token)
@limiter.limit("10/minute")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
        
    result = await auth_service.refresh_access_token(token)
    
    new_refresh_token = result.pop("refresh_token")
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=True, 
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )
    return result

@router.post("/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if token:
        await auth_service.logout(token)
    
    response.delete_cookie("refresh_token", httponly=True, secure=True, samesite="lax")
    return {"message": "Logged out successfully"}
