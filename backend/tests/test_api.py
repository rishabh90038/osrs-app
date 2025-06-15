import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import Base, get_db
from models import Item, Price

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture
def test_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def sample_items(test_db):
    # Create sample items
    items = [
        Item(id=1, name="Abyssal whip", members=True, icon="whip.png"),
        Item(id=2, name="Dragon bones", members=False, icon="bones.png"),
    ]
    for item in items:
        test_db.add(item)
    
    # Create sample prices
    prices = [
        Price(item_id=1, high=100000, low=95000, high_time="2024-03-20T12:00:00Z", low_time="2024-03-20T12:00:00Z"),
        Price(item_id=2, high=5000, low=4500, high_time="2024-03-20T12:00:00Z", low_time="2024-03-20T12:00:00Z"),
    ]
    for price in prices:
        test_db.add(price)
    
    test_db.commit()
    return items

def test_get_items(sample_items):
    response = client.get("/api/items")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert "total" in data
    assert len(data["results"]) == 2
    assert data["total"] == 2

def test_get_items_with_pagination(sample_items):
    response = client.get("/api/items?page=0&page_size=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 1
    assert data["total"] == 2

def test_get_items_with_search(sample_items):
    response = client.get("/api/items?search=whip")
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 1
    assert data["results"][0]["name"] == "Abyssal whip"

def test_get_items_with_price_filters(sample_items):
    response = client.get("/api/items?min_high=50000")
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 1
    assert data["results"][0]["name"] == "Abyssal whip"

def test_get_items_with_membership_filter(sample_items):
    response = client.get("/api/items?membership=true")
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 1
    assert data["results"][0]["name"] == "Abyssal whip"

def test_get_item_by_id(sample_items):
    response = client.get("/api/items/1")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Abyssal whip"
    assert data["high"] == 100000
    assert data["low"] == 95000

def test_get_nonexistent_item():
    response = client.get("/api/items/999")
    assert response.status_code == 404

def test_get_items_with_sorting(sample_items):
    response = client.get("/api/items?sort_by=name&sort_order=desc")
    assert response.status_code == 200
    data = response.json()
    assert data["results"][0]["name"] == "Dragon bones"
    assert data["results"][1]["name"] == "Abyssal whip"

def test_get_items_with_invalid_page():
    response = client.get("/api/items?page=-1")
    assert response.status_code == 400

def test_get_items_with_invalid_page_size():
    response = client.get("/api/items?page_size=0")
    assert response.status_code == 400

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_items_prices():
    response = client.get("/api/items-prices")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert "total" in data
    assert isinstance(data["results"], list) 