#!/bin/bash
# AGHAMazingQuestCMS Optimized Development Environment Setup Script
# This script sets up a high-performance full-stack development environment

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== AGHAMazingQuestCMS Optimized Development Environment Setup ===${NC}"
echo -e "${CYAN}=== Performance Optimized for Local & Network Development ===${NC}"

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

print_performance() {
    echo -e "${BLUE}[PERFORMANCE]${NC} $1"
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

# Check prerequisites with performance recommendations
print_status "Checking prerequisites with performance recommendations..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
else
    DOCKER_VERSION=$(docker --version)
    print_status "Docker is installed: $DOCKER_VERSION"
    
    # Check Docker system resources
    DOCKER_INFO=$(docker info 2>/dev/null || true)
    if echo "$DOCKER_INFO" | grep -q "Total Memory"; then
        MEMORY=$(echo "$DOCKER_INFO" | grep "Total Memory" | head -n1 | awk '{print $3$4}')
        print_performance "Docker allocated memory: $MEMORY"
        if [[ $(echo "$MEMORY" | sed 's/[^0-9.]//g') -lt 4 ]]; then
            print_warning "Docker memory allocation is low (< 4GB), consider increasing for optimal performance"
        fi
    fi
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose (v2) is not installed. Please install Docker Compose v2."
    exit 1
else
    COMPOSE_VERSION=$(docker compose version)
    print_status "Docker Compose is installed: $COMPOSE_VERSION"
fi

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    print_status "Node.js is installed: $NODE_VERSION"
    if [ "$NODE_MAJOR" -lt 18 ]; then
        print_warning "Node.js version is older than recommended (18+). Consider upgrading for optimal performance."
    fi
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

# Clean up any previous containers/networks to ensure fresh start
print_status "Cleaning up previous containers and networks..."
cd "$PROJECT_ROOT/devops"
docker compose -f docker-compose-fullstack.yml down --remove-orphans || true

# Remove any potentially stale networks
docker network ls | grep -q agha-network && docker network rm agha-network

# Create optimized Docker network
print_performance "Creating optimized Docker network for minimal latency..."
docker network create --driver bridge --opt com.docker.network.driver.mtu=1500 agha-network
print_status "Created optimized Docker network: agha-network"

# Optimize frontend dependencies for performance
print_performance "Optimizing frontend dependencies for faster builds..."
cd "$PROJECT_ROOT/frontend"

# Remove any problematic node_modules and reinstall
if [ -d "node_modules" ]; then
    print_status "Removing existing node_modules for clean install..."
    rm -rf node_modules
fi

# Install dependencies with performance optimizations
npm ci --prefer-offline --no-audit --no-fund
print_status "Frontend dependencies installed with performance optimizations"

# Return to project root
cd "$PROJECT_ROOT"

# Stop any existing containers
print_status "Preparing environment for optimized startup..."
cd "$PROJECT_ROOT/devops"

# Build and start the full stack with performance optimizations
print_performance "Building and starting services with performance optimizations..."
START_TIME=$(date +%s)
docker compose -f docker-compose-fullstack.yml up -d --build --force-recreate

print_status "Services started, waiting for readiness..."
sleep 20

# Wait for backend to be ready and run migrations
print_performance "Applying database migrations with optimized performance..."
MAX_RETRIES=40
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec agha-backend timeout 5 bash -c 'echo > /dev/tcp/localhost/8000' 2>/dev/null; then
        print_status "Backend service is responding"
        break
    else
        sleep 5
        RETRY_COUNT=$((RETRY_COUNT+1))
        print_status "Waiting for backend to be ready... ($RETRY_COUNT/$MAX_RETRIES)"
    fi
done

# Apply migrations
docker exec agha-backend python manage.py migrate --no-input

# Populate sample data
print_performance "Populating sample data with optimized performance..."
docker exec agha-backend python manage.py populate_sample_data

print_status "Finalizing service optimization..."

# Verify services are running
SERVICES=("agha-postgres" "agha-backend" "agha-frontend" "agha-nginx")
for SERVICE in "${SERVICES[@]}"; do
    if [ "$(docker inspect -f '{{.State.Status}}' $SERVICE 2>/dev/null)" = "running" ]; then
        # Get resource usage
        MEM_USAGE=$(docker stats --no-stream --format "table {{.MemUsage}}" $SERVICE 2>/dev/null | tail -n +2 | cut -d' ' -f1)
        CPU_USAGE=$(docker stats --no-stream --format "table {{.CPUPerc}}" $SERVICE 2>/dev/null | tail -n +2)
        print_status "$SERVICE is running (Memory: $MEM_USAGE, CPU: $CPU_USAGE)"
    else
        print_error "$SERVICE is not running properly"
        docker logs $SERVICE
        exit 1
    fi
done

# Final verification with performance metrics
print_performance "Performing final system verification with performance metrics..."
sleep 10

# Calculate total setup time
END_TIME=$(date +%s)
SETUP_DURATION=$((END_TIME - START_TIME))
print_performance "Total setup time: ${SETUP_DURATION}s"

# Test API performance on port 8081 since 8080 is in use
print_performance "Testing API performance on alternate port..."
API_START=$(date +%s)
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/api/)
API_END=$(date +%s)
API_DURATION=$((API_END - API_START))
if [ "$API_STATUS" -eq 200 ]; then
    print_status "API is accessible (Status: $API_STATUS, Response Time: ${API_DURATION}s)"
else
    print_error "API is not accessible (Status: $API_STATUS)"
    exit 1
fi

# Test Frontend performance on port 8081
FRONTEND_START=$(date +%s)
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/)
FRONTEND_END=$(date +%s)
FRONTEND_DURATION=$((FRONTEND_END - FRONTEND_START))
if [ "$FRONTEND_STATUS" -eq 200 ]; then
    print_status "Frontend is accessible (Status: $FRONTEND_STATUS, Response Time: ${FRONTEND_DURATION}s)"
else
    print_error "Frontend is not accessible (Status: $FRONTEND_STATUS)"
    exit 1
fi

# Test authentication performance on port 8081
AUTH_START=$(date +%s)
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8081/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"encoder_user","password":"demopass123"}')
AUTH_END=$(date +%s)
AUTH_DURATION=$((AUTH_END - AUTH_START))
if [ "$AUTH_STATUS" -eq 200 ]; then
    print_status "Authentication is working (Status: $AUTH_STATUS, Response Time: ${AUTH_DURATION}s)"
else
    print_error "Authentication is not working (Status: $AUTH_STATUS)"
    exit 1
fi

# Network accessibility check
print_performance "Checking network accessibility..."
if command -v hostname &> /dev/null; then
    LOCAL_IP=$(hostname -I | awk '{print $1}')
    if [ ! -z "$LOCAL_IP" ]; then
        print_status "Local network IP: $LOCAL_IP - Application accessible on local network at http://$LOCAL_IP:8081"
    fi
fi

print_status ""
print_performance "🚀 AGHAMazingQuestCMS Optimized Development Environment Setup Complete!"
print_status ""
print_status "High-Performance Services Available:"
print_status "  🌐 Main Application: http://localhost:8081"
print_status "  🔌 API Endpoint: http://localhost:8081/api/"
print_status "  👤 Admin Panel: http://localhost:8081/admin/"
print_status "  🛠️  pgAdmin: http://localhost:5050"
print_status ""
print_status "Demo User Credentials:"
print_status "  👤 Encoder/Editor/Approver/Admin: encoder_user/editor_user/approver_user/admin_user"
print_status "  🔐 Password: demopass123"
print_status "  👑 Super Admin: superadmin (password: superadmin123)"
print_status ""
print_status "Network Accessibility:"
print_status "  Devices on your network can access the app at: http://$(hostname -I | awk '{print $1}'):8081"
print_status ""
print_performance "Setup completed in ${SETUP_DURATION}s with optimized performance settings"
print_status "To stop the development environment, run: ./stop_optimized.sh"
print_status ""
print_warning "NOTE: Port 8080 was in use, so the application is running on port 8081 instead."
print_status ""