from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, asc, desc
from database import SessionLocal
from models import Item, ItemPrice
from schemas import ItemsPricesResponse, ItemSchema, ItemDetailSchema
import logging
from typing import Optional
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/api/items-prices", response_model=ItemsPricesResponse)
def get_items(
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: str = Query("", alias="search"),
    sort_by: str = Query("name", pattern="^(name|high|low|highTime|lowTime)$"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    min_high: Optional[float] = Query(None),
    max_high: Optional[float] = Query(None),
    min_low: Optional[float] = Query(None),
    max_low: Optional[float] = Query(None),
    membership: Optional[str] = Query(None)
):
    try:
        base_query = db.query(Item).join(ItemPrice).filter(Item.price != None)

        if search:
            base_query = base_query.filter(func.lower(Item.name).like(f"%{search.lower()}%"))
        if membership:
            base_query = base_query.filter(Item.members == membership)
        if min_high is not None:
            base_query = base_query.filter(ItemPrice.high >= min_high)
        if max_high is not None:
            base_query = base_query.filter(ItemPrice.high <= max_high)
        if min_low is not None:
            base_query = base_query.filter(ItemPrice.low >= min_low)
        if max_low is not None:
            base_query = base_query.filter(ItemPrice.low <= max_low)

        # Sorting
        if sort_by == "name":
            order_col = Item.name
        elif sort_by == "high":
            order_col = ItemPrice.high
        elif sort_by == "low":
            order_col = ItemPrice.low
        elif sort_by == "highTime":
            order_col = ItemPrice.highTime
        elif sort_by == "lowTime":
            order_col = ItemPrice.lowTime
        else:
            order_col = Item.name

        if sort_order == "desc":
            base_query = base_query.order_by(desc(order_col))
        else:
            base_query = base_query.order_by(asc(order_col))

        total = base_query.count()
        items = base_query.offset(offset).limit(limit).all()

        results = [
            ItemSchema(
                id=item.id,
                name=item.name,
                high=item.price.high,
                low=item.price.low,
                highTime=item.price.highTime,
                lowTime=item.price.lowTime
            )
            for item in items
        ]

        return ItemsPricesResponse(
            total=total,
            count=len(results),
            limit=limit,
            offset=offset,
            results=results
        )
    except Exception as e:
        logger.error(f"Error in get_items: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/api/items/{item_id}", response_model=ItemDetailSchema)
def get_item_detail(item_id: int, db: Session = Depends(get_db)):
    try:
        item = db.query(Item).filter(Item.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        return ItemDetailSchema(
            id=item.id,
            name=item.name,
            examine=item.examine,
            members=item.members,
            icon=item.icon,
            icon_large=item.icon_large,
            high=item.price.high if item.price else None,
            low=item.price.low if item.price else None,
            highTime=item.price.highTime if item.price else None,
            lowTime=item.price.lowTime if item.price else None
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_item_detail: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    try:
        total_items = db.query(Item).count()
        items_with_prices = db.query(Item).join(ItemPrice).count()
        latest_update = db.query(func.max(ItemPrice.highTime)).scalar()
        
        return {
            "total_items": total_items,
            "items_with_prices": items_with_prices,
            "latest_update": latest_update.isoformat() if latest_update else None
        }
    except Exception as e:
        logger.error(f"Error in get_stats: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat()
    }
