#!/bin/sh
set -e

echo ">>> Pushing database schema..."
PORT=3001 PAYLOAD_FORCE_DRIZZLE_PUSH=true NODE_ENV=development node server.js &
PUSH_PID=$!
sleep 30
kill $PUSH_PID 2>/dev/null || true
wait $PUSH_PID 2>/dev/null || true
echo ">>> Schema push complete."

exec node server.js
