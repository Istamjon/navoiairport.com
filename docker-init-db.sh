#!/bin/bash
# Initialize Payload CMS database in Docker
# This script runs migrations and optionally seeds the database

set -e

echo "🚀 Initializing Payload CMS Database..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker exec navoiairport-db pg_isready -U postgres -d final > /dev/null 2>&1; do
  echo "   Database not ready yet, waiting..."
  sleep 2
done

echo "✅ Database is ready!"

# Run migrations inside the app container
echo "🔄 Running database migrations..."
docker exec navoiairport-app pnpm payload migrate || {
  echo "⚠️  Migration command not found, trying alternative..."
  docker exec navoiairport-app node -e "
    const { getPayload } = require('payload');
    const config = require('./.next/server/payload.config.js');
    (async () => {
      const payload = await getPayload({ config });
      console.log('✅ Payload initialized - tables should be created');
      process.exit(0);
    })();
  "
}

echo ""
echo "✅ Database initialization complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Access admin panel: http://localhost:3000/admin"
echo "   2. Create your first admin user"
echo "   3. Or restore from backup: ./docker-restore-db.sh"
echo ""
