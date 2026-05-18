import json
from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Query
from app.core.logger import logger
from typing import Dict, List
import asyncio

router = APIRouter()

class StrategyConnectionManager:
    """
    Manages WebSocket connections for strategy generation progress.
    Connections are keyed by user_id.
    """
    def __init__(self):
        # user_id -> list of WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"WS Strategy: User {user_id} connected. Active for user: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"WS Strategy: User {user_id} disconnected.")

    async def send_progress(self, user_id: str, status: str, progress: int, extra: dict = None):
        """
        Sends progress update to all active connections for a specific user.
        """
        if user_id not in self.active_connections:
            return

        message = {
            "type": "progress",
            "status": status,
            "progress": progress,
            "extra": extra or {}
        }
        
        payload = json.dumps(message)
        dead_connections = []
        
        for connection in self.active_connections[user_id]:
            try:
                await connection.send_text(payload)
            except Exception:
                dead_connections.append(connection)
        
        for dead in dead_connections:
            self.disconnect(dead, user_id)

# Singleton manager
strategy_ws_manager = StrategyConnectionManager()

@router.websocket("/ws/strategy/{user_id}")
async def strategy_progress_endpoint(websocket: WebSocket, user_id: str):
    """
    Endpoint for real-time strategy generation updates.
    """
    await strategy_ws_manager.connect(websocket, user_id)
    try:
        while True:
            # Keep alive and handle potential client messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        strategy_ws_manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WS Strategy Error for user {user_id}: {e}")
        strategy_ws_manager.disconnect(websocket, user_id)
