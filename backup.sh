#!/bin/bash

# Exit on error
set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "📦 Starting database backup..."

# Get database container name
DB_CONTAINER=$(docker-compose -f docker-compose.prod.yml ps -q db)

if [ -z "$DB_CONTAINER" ]; then
    echo "❌ Database container not found. Is it running?"
    exit 1
fi

# Create backup
echo "💾 Creating backup..."
docker exec $DB_CONTAINER pg_dump -U osrsuser osrsdb > "$BACKUP_FILE"

# Compress backup
echo "🗜️ Compressing backup..."
gzip "$BACKUP_FILE"

echo "✅ Backup completed: ${BACKUP_FILE}.gz"

# Keep only last 7 backups
echo "🧹 Cleaning up old backups..."
ls -t "$BACKUP_DIR"/backup_*.sql.gz | tail -n +8 | xargs -r rm

echo "✨ Backup process completed!" 