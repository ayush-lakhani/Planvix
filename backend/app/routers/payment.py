from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.config import settings
from app.core.pricing import PRO_MONTHLY_PRICE
from app.core.mongo import users_collection
from app.dependencies.auth import get_current_user
from bson import ObjectId
from datetime import datetime, timezone
import razorpay
import asyncio

router = APIRouter(prefix="/api", tags=["Payments"])

razorpay_client = None
if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class CreateOrderRequest(BaseModel):
    amount: float

class ConfirmUpgradeRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str

@router.post("/create-order")
async def create_order(request: CreateOrderRequest):
    """Create Razorpay order for MVP demo"""
    if not razorpay_client:
        raise HTTPException(status_code=503, detail="Payment system not configured")
    
    try:
        # Convert INR to paise
        amount_in_paise = int(request.amount * 100)
        
        # Create order using Razorpay client
        order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1
        })
        
        return {
            "order_id": order.get("id"),
            "amount": order.get("amount"),
            "currency": order.get("currency"),
            "razorpay_key": settings.RAZORPAY_KEY_ID
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/confirm-upgrade")
async def confirm_upgrade(
    body: ConfirmUpgradeRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Confirms a successful Razorpay payment and upgrades the user's tier to 'pro'
    in MongoDB. Also broadcasts a live payment_received event to the admin dashboard
    via WebSocket so the admin panel updates in real-time.
    """
    user_id = current_user.get("user_id") or current_user.get("_id") or current_user.get("sub")
    email = current_user.get("email", "unknown")

    if not user_id:
        raise HTTPException(status_code=401, detail="Could not identify user from token")

    # Update tier to 'pro' in MongoDB
    try:
        result = await users_collection.update_one(
            {"_id": ObjectId(str(user_id))},
            {
                "$set": {
                    "tier": "pro",
                    "upgraded_at": datetime.now(timezone.utc),
                    "razorpay_payment_id": body.razorpay_payment_id,
                    "razorpay_order_id": body.razorpay_order_id,
                }
            }
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found in database")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")

    # Broadcast live event to admin dashboard WebSocket
    try:
        from app.websocket.activity_socket import broadcast_event
        asyncio.create_task(broadcast_event("payment_received", {
            "details": f"User upgraded to Pro: {email}",
            "email": email,
            "user_id": str(user_id),
            "payment_id": body.razorpay_payment_id,
            "amount": f"₹{PRO_MONTHLY_PRICE:,}",
            "severity": "success",
        }))
    except Exception:
        pass  # Non-critical — don't fail the upgrade if broadcast fails

    return {
        "status": "success",
        "tier": "pro",
        "message": f"User {email} successfully upgraded to Pro",
    }
