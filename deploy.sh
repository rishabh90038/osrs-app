#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Check if docker and docker-compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create production environment file if it doesn't exist
if [ ! -f .env.prod ]; then
    echo "📝 Creating .env.prod file..."
    cat > .env.prod << EOL
# Database Configuration
POSTGRES_USER=osrsuser
POSTGRES_PASSWORD=osrs_secure_password_2024
POSTGRES_DB=osrsdb
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Backend Configuration
ENVIRONMENT=production
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
API_HOST=0.0.0.0
API_PORT=8000
WORKERS=4
LOG_LEVEL=INFO

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_ENV=production
EOL
    echo "✅ Created .env.prod file"
fi

# Build production images
echo "🏗️ Building production images..."
docker-compose -f docker-compose.prod.yml build

# Stop existing containers if any
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🔄 Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend alembic upgrade head

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Check logs
echo "📋 Checking logs..."
docker-compose -f docker-compose.prod.yml logs --tail=50

echo "✅ Deployment completed!"
echo "🌐 Frontend should be available at: http://localhost:3000"
echo "🔌 Backend API should be available at: http://localhost:8000"
echo "📊 API documentation should be available at: http://localhost:8000/docs" 