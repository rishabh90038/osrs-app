from sqlalchemy.orm import Session
from models import Item, ItemPrice
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def upsert_items(db: Session, items: list):
    try:
        for item_data in items:
            try:
                item = db.query(Item).filter_by(id=item_data['id']).first()
                if item:
                    # Update existing item
                    for key, value in item_data.items():
                        setattr(item, key, value)
                else:
                    # Create new item
                    item = Item(**item_data)
                    db.add(item)
            except Exception as e:
                logger.error(f"Error upserting item {item_data.get('id')}: {e}")
                continue
        
        db.commit()
        logger.info("Items updated successfully")
    except Exception as e:
        logger.error(f"Error in upsert_items: {e}", exc_info=True)
        db.rollback()
        raise

def update_prices(db: Session, prices: dict):
    try:
        updated_count = 0
        for item_id, data in prices.items():
            try:
                item = db.query(Item).get(int(item_id))
                if not item:
                    logger.warning(f"Item {item_id} not found in database")
                    continue

                # Validate price data
                if not all(key in data for key in ["high", "low", "highTime", "lowTime"]):
                    logger.warning(f"Invalid price data for item {item_id}")
                    continue

                try:
                    high_time = datetime.fromtimestamp(data['highTime'])
                    low_time = datetime.fromtimestamp(data['lowTime'])
                except (ValueError, TypeError) as e:
                    logger.warning(f"Invalid timestamp for item {item_id}: {e}")
                    continue

                price = db.query(ItemPrice).filter_by(item_id=item.id).first()
                if price:
                    # Only update if price or timestamp has changed
                    if (
                        price.high != data['high'] or
                        price.highTime != high_time or
                        price.low != data['low'] or
                        price.lowTime != low_time
                    ):
                        price.high = data['high']
                        price.highTime = high_time
                        price.low = data['low']
                        price.lowTime = low_time
                        updated_count += 1
                else:
                    # Create new price record
                    price = ItemPrice(
                        item_id=item.id,
                        high=data['high'],
                        highTime=high_time,
                        low=data['low'],
                        lowTime=low_time
                    )
                    db.add(price)
                    updated_count += 1
            except Exception as e:
                logger.error(f"Error updating price for item {item_id}: {e}")
                continue

        if updated_count > 0:
            db.commit()
            logger.info(f"Prices updated for {updated_count} items")
        else:
            logger.info("No prices were updated")
    except Exception as e:
        logger.error(f"Error in update_prices: {e}", exc_info=True)
        db.rollback()
        raise
