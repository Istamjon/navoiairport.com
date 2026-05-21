#!/bin/sh
set -e

echo "=== Navoi Airport Production Startup ==="

# Extract database connection details from DATABASE_URL
# Format: postgres://user:password@host:port/dbname
DB_URL="${DATABASE_URL}"

# Wait for database to be ready
echo "Waiting for database..."
until PGPASSWORD=$(echo "$DB_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p') \
  psql -h "$(echo "$DB_URL" | sed -n 's|.*://[^@]*@\([^:]*\):.*|\1|p')" \
  -p "$(echo "$DB_URL" | sed -n 's|.*://[^@]*:[^@]*@\([^:]*\):\([0-9]*\)/.*|\2|p')" \
  -U "$(echo "$DB_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')" \
  -d "$(echo "$DB_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')" \
  -c "SELECT 1" >/dev/null 2>&1; do
  echo "Database not ready, waiting..."
  sleep 2
done
echo "Database connected"

# Fix dev mode migration batch (-1) to prevent prompts
echo "Cleaning up dev mode migrations..."
PGPASSWORD=$(echo "$DB_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p') \
psql -h "$(echo "$DB_URL" | sed -n 's|.*://[^@]*@\([^:]*\):.*|\1|p')" \
  -p "$(echo "$DB_URL" | sed -n 's|.*://[^@]*:[^@]*@\([^:]*\):\([0-9]*\)/.*|\2|p')" \
  -U "$(echo "$DB_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')" \
  -d "$(echo "$DB_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')" \
  -c "DELETE FROM payload_migrations WHERE batch = -1;" 2>/dev/null || echo "No dev mode migrations to clean or table doesn't exist yet"

echo "Starting Payload CMS..."
exec node server.js
