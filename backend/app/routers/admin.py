from fastapi import APIRouter, Header, HTTPException, Depends
from app.core.config import settings
from app.services.analytics_service import analytics_service

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"]
)

# Admin Secret Validation
async def verify_admin(x_admin_secret: str = Header(None)):
    if not x_admin_secret or x_admin_secret != settings.ADMIN_SECRET:
        raise HTTPException(status_code=401, detail="Invalid admin secret")
    return True


@router.get("/dashboard")
async def get_dashboard_stats(_: bool = Depends(verify_admin)):
    return await analytics_service.get_dashboard_stats()


@router.get("/users")
async def get_users(search: str = "", limit: int = 20, _: bool = Depends(verify_admin)):
    return {"users": await analytics_service.get_users(search, limit)}


@router.get("/revenue-breakdown")
async def get_revenue_breakdown(_: bool = Depends(verify_admin)):
    return {"industries": await analytics_service.get_revenue_breakdown()}


@router.get("/activity")
async def get_activity(_: bool = Depends(verify_admin)):
    return {"activities": await analytics_service.get_recent_activity()}


@router.get("/alerts")
async def get_alerts(_: bool = Depends(verify_admin)):
    return {"alerts": await analytics_service.get_system_alerts()}
