#!/bin/bash
set -e

echo "Restoring database from custom-format dump..."
# We use 'final' as target DB (should be created by POSTGRES_DB env var)
# We use --no-owner to avoid permission issues if the dump has a different user
pg_restore -U "$POSTGRES_USER" -d "final" --no-owner --no-privileges /tmp/final.dump || true
echo "Restore complete."
