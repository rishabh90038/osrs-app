from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from api import router as api_router
from fetcher import start_background_tasks
from websocket import manager
import logging
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
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    init_db()
    start_background_tasks()
    logger.info("✅ Application startup complete")


app.include_router(api_router)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    logger.info("🌐 WebSocket connection established")

    try:
        while True:
            try:
                data = await websocket.receive_text()
                logger.debug(f"📩 Received: {data}")

                # Handle JSON messages
                try:
                    message = json.loads(data)
                    if message.get("type") == "ping":
                        await websocket.send_json({"type": "pong"})
                        logger.debug("🔁 Received ping, sent pong")
                except json.JSONDecodeError:
                    logger.warning(f"⚠️ Invalid JSON message: {data}")

            except WebSocketDisconnect:
                logger.info("❌ WebSocket client disconnected")
                break
            except Exception as e:
                logger.error(f"🔥 Exception in WebSocket handler: {e}")
                logger.error(traceback.format_exc())
                break
    finally:
        manager.disconnect(websocket)
        logger.info("🔌 WebSocket cleaned up")
