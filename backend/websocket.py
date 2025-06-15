from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
from datetime import datetime
import logging
import traceback

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        try:
            await websocket.accept()
            self.active_connections.append(websocket)
            logger.info(f"New WebSocket connection established. Total connections: {len(self.active_connections)}")
            
            # Send initial connection success message
            await websocket.send_json({
                "type": "connection_status",
                "status": "connected",
                "message": "Successfully connected to WebSocket server"
            })
        except Exception as e:
            logger.error(f"Error accepting WebSocket connection: {e}")
            logger.error(traceback.format_exc())
            raise

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket connection closed. Remaining connections: {len(self.active_connections)}")

    async def broadcast(self, message: Dict):
        if not self.active_connections:
            return

        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")
                logger.error(traceback.format_exc())
                disconnected.append(connection)

        # Clean up broken connections
        for connection in disconnected:
            self.disconnect(connection)


manager = ConnectionManager()


async def broadcast_price_update(item_id: int, high: float, low: float, high_time: datetime, low_time: datetime):
    try:
        message = {
            "type": "price_update",
            "item_id": item_id,
            "high": high,
            "low": low,
            "highTime": high_time.isoformat() if high_time else None,
            "lowTime": low_time.isoformat() if low_time else None,
        }
        await manager.broadcast(message)
    except Exception as e:
        logger.error(f"Error broadcasting price update: {e}")
        logger.error(traceback.format_exc())
