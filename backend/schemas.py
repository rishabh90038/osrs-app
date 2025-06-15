from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ItemSchema(BaseModel):
    id: int
    name: str
    high: float
    low: float
    highTime: Optional[datetime] = None
    lowTime: Optional[datetime] = None

    class Config:
        from_attributes = True

class ItemDetailSchema(BaseModel):
    id: int
    name: str
    examine: str
    members: str
    icon: str
    icon_large: str
    high: Optional[float] = None
    low: Optional[float] = None
    highTime: Optional[datetime] = None
    lowTime: Optional[datetime] = None

    class Config:
        from_attributes = True

class ItemsPricesResponse(BaseModel):
    total: int
    count: int
    limit: int
    offset: int
    results: List[ItemSchema] 