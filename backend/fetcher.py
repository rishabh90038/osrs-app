import asyncio
import aiohttp
from database import SessionLocal
from crud import upsert_items, update_prices

async def fetch_and_store():
    async with aiohttp.ClientSession() as session:
        async with session.get("https://prices.runescape.wiki/api/v1/osrs/mapping") as resp1:
            items = await resp1.json()

        async with session.get("https://prices.runescape.wiki/api/v1/osrs/latest") as resp2:
            prices = await resp2.json()

        db = SessionLocal()
        try:
            upsert_items(db, items)
            update_prices(db, prices.get("data", {}))
        finally:
            db.close()

async def scheduler():
    while True:
        await fetch_and_store()
        await asyncio.sleep(300)  # every 5 min

def start_background_tasks():
    loop = asyncio.get_event_loop()
    loop.create_task(scheduler())
