# OSRS Item Prices Live Tracker

A real-time web application that displays and tracks Old School RuneScape (OSRS) item prices. The application provides live updates of item prices, allowing users to make informed trading decisions.

## Features

- Real-time price updates using WebSocket
- Comprehensive filtering and sorting options
- Price change indicators
- Item icons and details
- Dark theme UI
- Responsive design
- Server-side pagination
- Search functionality

## Tech Stack

- Frontend: React with Material-UI
- Backend: FastAPI (Python)
- Database: PostgreSQL
- Real-time Updates: WebSocket
- Deployment: Docker & Docker Compose

## Prerequisites

- Docker
- Docker Compose
- Node.js (for local development)
- Python 3.8+ (for local development)

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd osrs-app
```

2. Start the application using Docker Compose:
```bash
docker compose up
```

3. Access the application at `http://localhost:3000`

## Local Development

### Backend Setup

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up the database:
```bash
alembic upgrade head
```

4. Start the backend server:
```bash
uvicorn main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

## Project Structure

```
osrs-app/
├── backend/
│   ├── alembic/          # Database migrations
│   ├── tests/            # Backend tests
│   ├── api.py            # API endpoints
│   ├── crud.py           # Database operations
│   ├── database.py       # Database configuration
│   ├── fetcher.py        # OSRS API integration
│   ├── main.py           # FastAPI application
│   ├── models.py         # Database models
│   ├── schemas.py        # Pydantic schemas
│   └── websocket.py      # WebSocket implementation
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API and WebSocket services
│   │   ├── utils/        # Utility functions
│   │   └── constants/    # Configuration constants
│   └── public/           # Static assets
└── docker-compose.yml    # Docker configuration
```

## API Documentation

The backend API documentation is available at `http://localhost:8000/docs` when running the application.

### Main Endpoints

- `GET /api/items`: Get paginated list of items with prices
- `GET /api/items/{id}`: Get detailed information about a specific item
- `WS /ws`: WebSocket endpoint for real-time price updates

## Database Schema

The application uses PostgreSQL with the following main tables:

### Items
- `id`: Integer (Primary Key)
- `name`: String
- `members`: Boolean
- `icon`: String (URL)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Prices
- `item_id`: Integer (Foreign Key)
- `high`: Integer
- `low`: Integer
- `high_time`: Timestamp
- `low_time`: Timestamp
- `created_at`: Timestamp

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OSRS Wiki for providing the item price APIs
- Material-UI for the frontend components
- FastAPI for the backend framework 