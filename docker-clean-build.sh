#!/bin/bash
# Clean Docker cache and rebuild
# Fixes: "parent snapshot does not exist: not found" error

set -e

echo "🧹 Cleaning Docker build cache..."

# Stop all containers
echo "⏹️  Stopping containers..."
docker-compose down 2>/dev/null || true

# Remove old images
echo "🗑️  Removing old images..."
docker-compose rm -f 2>/dev/null || true
docker rmi navoiairportcom-payload 2>/dev/null || true

# Prune build cache
echo "🧽 Pruning build cache..."
docker builder prune -f

echo ""
echo "✅ Docker cache cleaned!"
echo ""
echo "🔨 Now rebuilding..."
docker-compose up -d --build --force-recreate

echo ""
echo "✅ Build complete! Checking status..."
docker-compose ps

echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f payload"
