#!/bin/sh
set -e

echo "=== Navoi Airport Production Startup ==="

# Extract database connection details from DATABASE_URL
DB_URL="${DATABASE_URL}"
DB_HOST=$(echo "$DB_URL" | sed -n 's|.*://[^@]*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo "$DB_URL" | sed -n 's|.*://[^@]*:[^@]*@\([^:]*\):\([0-9]*\)/.*|\2|p')
DB_USER=$(echo "$DB_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DB_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_NAME=$(echo "$DB_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')

PSQL="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
export PGPASSWORD="$DB_PASS"

# Wait for database to be ready
echo "Waiting for database..."
until $PSQL -c "SELECT 1" >/dev/null 2>&1; do
  echo "Database not ready, waiting..."
  sleep 2
done
echo "Database connected"

# Check if payload_migrations table exists
TABLE_EXISTS=$($PSQL -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payload_migrations');" 2>/dev/null | tr -d '[:space:]')

if [ "$TABLE_EXISTS" = "t" ]; then
  echo "Cleaning up dev mode migrations..."
  $PSQL -c "DELETE FROM payload_migrations WHERE batch = -1;" 2>/dev/null || true

  # Mark existing migrations as applied so Payload skips them
  echo "Registering existing migrations..."
  $PSQL -c "
    INSERT INTO payload_migrations (name, batch, created_at, updated_at)
    SELECT m.name, 1, NOW(), NOW()
    FROM (VALUES
      ('20260317_191617_localization_fix'),
      ('20260317_191943_finalize_localization'),
      ('20260317_192533_fix_hero_localization'),
      ('20260317_192941_fix_hero_localization_final_v2')
    ) AS m(name)
    WHERE NOT EXISTS (SELECT 1 FROM payload_migrations pm WHERE pm.name = m.name);
  " 2>/dev/null || true
  echo "Migrations registered"
else
  echo "payload_migrations table does not exist yet"
fi

echo "Starting Payload CMS..."
exec node server.js
