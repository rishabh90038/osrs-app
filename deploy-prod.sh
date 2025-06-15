#!/bin/bash

# Exit on error
set -e

# Configuration
DOMAIN="your-domain.com"
APP_DIR="/var/www/osrs-app"

echo "🚀 Starting production deployment..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root"
    exit 1
fi

# Update Nginx configuration
echo "📝 Updating Nginx configuration..."
cp nginx.conf.prod /etc/nginx/sites-available/$DOMAIN
sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/$DOMAIN
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Set up SSL with Let's Encrypt
echo "🔒 Setting up SSL..."
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
fi

# Request SSL certificate
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email your-email@example.com

# Update environment variables
echo "⚙️ Updating environment variables..."
cat > $APP_DIR/.env.prod << EOL
# Database Configuration
POSTGRES_USER=osrsuser
POSTGRES_PASSWORD=$(openssl rand -base64 32)
POSTGRES_DB=osrsdb
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Backend Configuration
ENVIRONMENT=production
CORS_ORIGINS=https://$DOMAIN
API_HOST=0.0.0.0
API_PORT=8000
WORKERS=4
LOG_LEVEL=INFO

# Frontend Configuration
REACT_APP_API_URL=https://$DOMAIN/api
REACT_APP_WS_URL=wss://$DOMAIN/ws
REACT_APP_ENV=production
EOL

# Deploy application
echo "🚀 Deploying application..."
cd $APP_DIR
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run migrations
echo "🔄 Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend alembic upgrade head

# Check status
echo "🔍 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ Deployment completed!"
echo "🌐 Your application is now available at: https://$DOMAIN" 