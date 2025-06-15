import asyncio
import aiohttp
import logging
from datetime import datetime
from database import SessionLocal
from crud import upsert_items, update_prices
from models import ItemPrice, Item
from websocket import broadcast_price_update

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def fetch_data(session, url):
    try:
        async with session.get(url) as response:
            if response.status != 200:
                logger.error(f"Failed to fetch data from {url}. Status: {response.status}")
                return None
            return await response.json()
    except Exception as e:
        logger.error(f"Error fetching data from {url}: {str(e)}")
        return None

async def fetch_and_store():
    async with aiohttp.ClientSession() as session:
        try:
            # Fetch items and prices concurrently
            logger.info("Fetching data from OSRS API...")
            items_task = fetch_data(session, "https://prices.runescape.wiki/api/v1/osrs/mapping")
            prices_task = fetch_data(session, "https://prices.runescape.wiki/api/v1/osrs/latest")
            
            items, prices = await asyncio.gather(items_task, prices_task)
            
            if not items or not prices:
                logger.error("Failed to fetch required data")
                return

            logger.info(f"Successfully fetched {len(items)} items and price data")
            db = SessionLocal()
            try:
                # First, ensure all items are in the database
                logger.info("Updating items in database...")
                upsert_items(db, items)
                
                # Get current prices and items from database
                logger.info("Fetching current prices from database...")
                current_prices = {
                    price.item_id: price
                    for price in db.query(ItemPrice).all()
                }
                
                # Get all valid item IDs
                valid_item_ids = {
                    item.id for item in db.query(Item).all()
                }
                logger.info(f"Found {len(valid_item_ids)} valid items in database")
                
                # Update only changed prices
                price_data = prices.get("data", {})
                changed_prices = {}
                
                logger.info("Processing price updates...")
                for item_id, data in price_data.items():
                    try:
                        item_id = int(item_id)
                        # Only process items that exist in our database
                        if item_id not in valid_item_ids:
                            logger.debug(f"Skipping price update for non-existent item {item_id}")
                            continue
                            
                        if item_id not in current_prices or (
                            current_prices[item_id].high != data.get("high") or
                            current_prices[item_id].low != data.get("low")
                        ):
                            # Validate price data
                            if all(key in data for key in ["high", "low", "highTime", "lowTime"]):
                                changed_prices[item_id] = data
                    except (ValueError, TypeError) as e:
                        logger.warning(f"Invalid item_id or price data for item {item_id}: {e}")
                        continue
                
                if changed_prices:
                    logger.info(f"Updating {len(changed_prices)} changed prices")
                    update_prices(db, changed_prices)
                    
                    # Broadcast price updates only for valid items
                    logger.info("Broadcasting price updates...")
                    for item_id, price_data in changed_prices.items():
                        try:
                            if item_id in valid_item_ids:
                                await broadcast_price_update(
                                    item_id=item_id,
                                    high=price_data.get("high"),
                                    low=price_data.get("low"),
                                    high_time=datetime.fromtimestamp(price_data.get("highTime", 0)),
                                    low_time=datetime.fromtimestamp(price_data.get("lowTime", 0))
                                )
                        except Exception as e:
                            logger.error(f"Error broadcasting price update for item {item_id}: {e}")
                else:
                    logger.info("No price changes detected")
                    
            except Exception as e:
                logger.error(f"Error updating database: {str(e)}", exc_info=True)
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error in fetch_and_store: {str(e)}", exc_info=True)

async def scheduler():
    while True:
        try:
            await fetch_and_store()
        except Exception as e:
            logger.error(f"Scheduler error: {str(e)}", exc_info=True)
        await asyncio.sleep(300)  # every 5 min

def start_background_tasks():
    loop = asyncio.get_event_loop()
    loop.create_task(scheduler())
    logger.info("Background price update task started")
