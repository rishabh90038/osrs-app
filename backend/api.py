from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import SessionLocal
from models import Item

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/api/items-prices")
def get_items(
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: str = Query("", alias="search")
):
    base_query = db.query(Item).join(Item.price).filter(Item.price != None)

    if search:
        base_query = base_query.filter(func.lower(Item.name).like(f"%{search.lower()}%"))

    total = base_query.count()

    items = base_query.offset(offset).limit(limit).all()

    results = [
        {
            "id": item.id,
            "name": item.name,
            "high": item.price.high,
            "low": item.price.low
        }
        for item in items
    ]

    return {
        "total": total,
        "count": len(results),
        "limit": limit,
        "offset": offset,
        "results": results
    }
