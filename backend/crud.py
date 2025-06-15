from sqlalchemy.orm import Session
from models import Item, ItemPrice
from datetime import datetime

def upsert_items(db: Session, items: list[dict]):
    for i in items:
        item = db.query(Item).get(i["id"])
        if not item:
            item = Item(
                id=i["id"],
                name=i["name"],
                examine=i.get("examine", ""),
                members=str(i.get("members", "")),
                icon=i.get("icon", ""),
                icon_large=i.get("icon_large", "")
            )
            db.add(item)
    db.commit()

def update_prices(db: Session, prices: dict):
    for item_id, data in prices.items():
        item = db.query(Item).get(int(item_id))
        if item:
            price = db.query(ItemPrice).filter_by(item_id=item.id).first()
            high_time = datetime.fromtimestamp(data['highTime'])
            low_time = datetime.fromtimestamp(data['lowTime'])

            if price:
                price.high = data['high']
                price.highTime = high_time
                price.low = data['low']
                price.lowTime = low_time
            else:
                price = ItemPrice(
                    item_id=item.id,
                    high=data['high'],
                    highTime=high_time,
                    low=data['low'],
                    lowTime=low_time
                )
                db.add(price)
    db.commit()
