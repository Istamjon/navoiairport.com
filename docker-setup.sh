#!/bin/bash
# Professional Docker Setup Script for Navoi Airport
# This script ensures complete and error-free Docker deployment

set -e

echo "🚀 Navoi Airport - Professional Docker Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi
print_success "Docker is installed"

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi
print_success "Docker Compose is installed"

# Step 2: Check if .env file exists
echo ""
echo "Step 2: Checking environment configuration..."
if [ ! -f ".env" ]; then
    print_info "Creating .env file from template..."
    cat > .env << EOF
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=navoiairport2024
POSTGRES_DB=final
POSTGRES_PORT=5432

# Payload CMS Configuration
PAYLOAD_SECRET=ecce34137f3d0597a6e70f6b_production_secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Node Environment
NODE_ENV=production
EOF
    print_success ".env file created"
else
    print_success ".env file exists"
fi

# Step 3: Ensure media directory exists
echo ""
echo "Step 3: Setting up media directory..."
if [ ! -d "public/media" ]; then
    mkdir -p public/media
    print_success "Media directory created"
else
    print_success "Media directory exists"
fi

# Step 4: Stop existing containers
echo ""
echo "Step 4: Stopping existing containers..."
docker-compose down 2>/dev/null || true
print_success "Existing containers stopped"

# Step 5: Build and start services
echo ""
echo "Step 5: Building and starting services..."
print_info "This may take a few minutes..."
docker-compose up -d --build

# Step 6: Wait for database to be ready
echo ""
echo "Step 6: Waiting for database to be ready..."
sleep 5
for i in {1..30}; do
    if docker exec navoiairport-db pg_isready -U postgres -d final &> /dev/null; then
        print_success "Database is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Database failed to start"
        docker-compose logs db
        exit 1
    fi
    echo -n "."
    sleep 1
done

# Step 7: Import database if final.sql exists
echo ""
echo "Step 7: Checking for database dump..."
if [ -f "final.sql" ]; then
    print_info "Importing database from final.sql..."
    
    # Copy dump file to container
    docker cp final.sql navoiairport-db:/tmp/final.dump
    
    # Restore database
    docker exec navoiairport-db sh -c "pg_restore -U postgres -d final --clean --if-exists --no-owner --no-privileges /tmp/final.dump" 2>/dev/null || true
    
    # Verify tables
    TABLE_COUNT=$(docker exec navoiairport-db psql -U postgres -d final -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    
    if [ "$TABLE_COUNT" -gt 0 ]; then
        print_success "Database imported successfully ($TABLE_COUNT tables)"
    else
        print_error "Database import failed"
    fi
else
    print_info "No final.sql found - database will be initialized by Payload CMS"
fi

# Step 8: Wait for application to be ready
echo ""
echo "Step 8: Waiting for application to start..."
sleep 10
for i in {1..60}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Application is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        print_error "Application failed to start"
        docker-compose logs payload
        exit 1
    fi
    echo -n "."
    sleep 1
done

# Step 9: Display status
echo ""
echo "Step 9: Deployment status..."
docker-compose ps

# Final summary
echo ""
echo "=============================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=============================================="
echo ""
echo "Access your application:"
echo "  Frontend:    http://localhost:3000"
echo "  Admin Panel: http://localhost:3000/admin"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose logs -f"
echo "  Stop services:    docker-compose down"
echo "  Restart:          docker-compose restart"
echo ""
print_success "Setup completed successfully!"
