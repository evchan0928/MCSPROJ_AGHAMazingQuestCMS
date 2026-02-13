#!/bin/bash
# AGHAMazingQuestCMS Development Environment Setup Script
# This script sets up the complete full-stack development environment

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== AGHAMazingQuestCMS Development Environment Setup ===${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Linux
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="macos"
else
    print_error "Unsupported platform: $OSTYPE"
    exit 1
fi

print_status "Detected platform: $PLATFORM"

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
else
    print_status "Docker is installed: $(docker --version)"
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose (v2) is not installed. Please install Docker Compose v2."
    exit 1
else
    print_status "Docker Compose is installed: $(docker compose version)"
fi

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check npm version
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
print_status "Project root: $PROJECT_ROOT"

# Navigate to project root
cd "$PROJECT_ROOT"

# Ensure Docker network exists
print_status "Ensuring Docker network exists..."
if ! docker network ls | grep -q agha-network; then
    docker network create agha-network
    print_status "Created Docker network: agha-network"
else
    print_status "Docker network 'agha-network' already exists"
fi

# Update frontend environment for development
print_status "Configuring frontend environment..."
FRONTEND_ENV_FILE="$PROJECT_ROOT/frontend/.env"
if [ ! -f "$FRONTEND_ENV_FILE" ]; then
    echo "# Environment variables for the frontend application
REACT_APP_BACKEND_API_URL=/api" > "$FRONTEND_ENV_FILE"
    print_status "Created frontend .env file"
else
    # Update the API URL to use the proxy
    sed -i 's|REACT_APP_BACKEND_API_URL=.*|REACT_APP_BACKEND_API_URL=/api|' "$FRONTEND_ENV_FILE"
    print_status "Updated frontend .env file"
fi

# Fix the package-lock.json in case of inconsistencies
print_status "Verifying frontend dependencies..."
cd "$PROJECT_ROOT/frontend"
npm install --package-lock-only
print_status "Fixed package-lock.json"

# Go back to project root
cd "$PROJECT_ROOT"

# Stop any existing containers
print_status "Stopping existing containers if any..."
cd "$PROJECT_ROOT/devops"
docker compose -f docker-compose-fullstack.yml down --remove-orphans || true

# Start the full stack
print_status "Building and starting the full stack..."
docker compose -f docker-compose-fullstack.yml up -d --build

print_status "Waiting for services to be ready..."
sleep 15

# Wait for backend to be ready and run migrations
print_status "Ensuring database migrations are applied..."
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec agha-backend python manage.py showmigrations --plan | grep -q "[ ]"; then
        sleep 5
        RETRY_COUNT=$((RETRY_COUNT+1))
        print_status "Waiting for backend to be ready... ($RETRY_COUNT/$MAX_RETRIES)"
    else
        break
    fi
done

# Apply migrations
print_status "Applying database migrations..."
docker exec agha-backend python manage.py migrate

# Populate sample data
print_status "Populating sample data..."
docker exec agha-backend python manage.py populate_sample_data

print_status "Services are starting up... waiting for readiness..."

# Verify services are running
SERVICES=("agha-postgres" "agha-backend" "agha-frontend" "agha-nginx")
for SERVICE in "${SERVICES[@]}"; do
    if [ "$(docker inspect -f '{{.State.Running}}' $SERVICE 2>/dev/null)" = "true" ]; then
        print_status "$SERVICE is running"
    else
        print_error "$SERVICE is not running properly"
        docker logs $SERVICE
        exit 1
    fi
done

# Final verification
print_status "Performing final system verification..."
sleep 10

# Test API
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/)
if [ "$API_STATUS" -eq 200 ]; then
    print_status "API is accessible (Status: $API_STATUS)"
else
    print_error "API is not accessible (Status: $API_STATUS)"
    exit 1
fi

# Test Frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/)
if [ "$FRONTEND_STATUS" -eq 200 ]; then
    print_status "Frontend is accessible (Status: $FRONTEND_STATUS)"
else
    print_error "Frontend is not accessible (Status: $FRONTEND_STATUS)"
    exit 1
fi

# Test authentication
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8080/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"encoder_user","password":"demopass123"}')
if [ "$AUTH_STATUS" -eq 200 ]; then
    print_status "Authentication is working (Status: $AUTH_STATUS)"
else
    print_error "Authentication is not working (Status: $AUTH_STATUS)"
    exit 1
fi

print_status ""
print_status "🎉 AGHAMazingQuestCMS Development Environment Setup Complete!"
print_status ""
print_status "Available Services:"
print_status "  Frontend: http://localhost:8080"
print_status "  API Root: http://localhost:8080/api/"
print_status "  Admin Panel: http://localhost:8080/admin/"
print_status "  pgAdmin: http://localhost:5050"
print_status ""
print_status "Demo User Credentials:"
print_status "  Username: encoder_user, editor_user, approver_user, admin_user, superadmin"
print_status "  Password: demopass123"
print_status ""
print_status "To stop the development environment, run: ./stop_development.sh"
print_status ""