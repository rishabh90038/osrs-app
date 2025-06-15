from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    examine = Column(String)
    members = Column(String)
    icon = Column(String)
    icon_large = Column(String)
    lowalch = Column(Integer)
    highalch = Column(Integer)
    value = Column(Integer)

    price = relationship("ItemPrice", back_populates="item", uselist=False)

class ItemPrice(Base):
    __tablename__ = "item_prices"
    id = Column(Integer, primary_key=True)
    item_id = Column(Integer, ForeignKey("items.id"))
    high = Column(Float)
    highTime = Column(DateTime)
    low = Column(Float)
    lowTime = Column(DateTime)

    item = relationship("Item", back_populates="price")
