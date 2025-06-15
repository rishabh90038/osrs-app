from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware  # ✅ required for CORS
from database import init_db
from api import router as api_router
from fetcher import start_background_tasks
from websocket import manager
import logging
import asyncio
import json
import traceback

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

logger = logging.getLogger(__name__)

app = FastAPI(title="OSRS Item Prices API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    init_db()
    start_background_tasks()
    logger.info("Application startup complete")

app.include_router(api_router)

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    try:
        await manager.connect(websocket)
        logger.info("WebSocket connection established")
        
        while True:
            try:
                # Keep the connection alive and handle client messages
                data = await websocket.receive_text()
                try:
                    message = json.loads(data)
                    if message.get("type") == "ping":
                        await websocket.send_json({"type": "pong"})
                        logger.debug("Received ping, sent pong")
                except json.JSONDecodeError:
                    logger.warning(f"Received invalid JSON: {data}")
            except WebSocketDisconnect:
                logger.info("WebSocket client disconnected")
                manager.disconnect(websocket)
                break
            except Exception as e:
                logger.error(f"Error in WebSocket connection: {e}")
                logger.error(traceback.format_exc())
                manager.disconnect(websocket)
                break
    except Exception as e:
        logger.error(f"Error establishing WebSocket connection: {e}")
        logger.error(traceback.format_exc())
        try:
            await websocket.close()
        except:
            pass
