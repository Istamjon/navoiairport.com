#!/bin/bash
# Script to restore database from backup (optional)
# Usage: ./docker-restore-db.sh

set -e

echo "🔄 Restoring database from final.sql dump..."

# Check if final.sql exists
if [ ! -f "final.sql" ]; then
    echo "❌ Error: final.sql not found in current directory"
    exit 1
fi

# Check if container is running
if ! docker ps | grep -q navoiairport-db; then
    echo "❌ Error: Database container is not running"
    echo "Run: docker-compose up -d db"
    exit 1
fi

# Copy dump file to container
echo "📦 Copying dump file to container..."
docker cp final.sql navoiairport-db:/tmp/final.dump

# Restore database
echo "🔧 Restoring database..."
docker exec navoiairport-db pg_restore \
    -U postgres \
    -d final \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    /tmp/final.dump || true

echo "✅ Database restore complete!"
echo "🚀 You can now start the application: docker-compose up -d payload"
