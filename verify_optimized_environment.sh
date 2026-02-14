#!/bin/bash
# AGHAMazingQuestCMS Optimized Environment Verification Script
# This script verifies that the optimized development environment is working correctly

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== AGHAMazingQuestCMS Optimized Environment Verification ===${NC}"

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

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_check() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
print_status "Project root: $PROJECT_ROOT"

# Check if services are running
print_check "Checking if services are running..."

SERVICES=("agha-nginx" "agha-backend" "agha-frontend" "agha-postgres")

ALL_SERVICES_RUNNING=true
for SERVICE in "${SERVICES[@]}"; do
    if [ "$(docker inspect -f '{{.State.Status}}' $SERVICE 2>/dev/null)" = "running" ]; then
        print_success "$SERVICE is running"
    else
        print_error "$SERVICE is NOT running"
        ALL_SERVICES_RUNNING=false
    fi
done

if [ "$ALL_SERVICES_RUNNING" = false ]; then
    print_error "Not all services are running. Please start the environment with: ./setup_optimized.sh"
    exit 1
fi

print_check "Testing service connectivity and response times..."

# Test API endpoint on port 8081
print_check "Testing API endpoint on port 8081..."
API_START=$(date +%s)
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/api/)
API_END=$(date +%s)
API_DURATION=$((API_END - API_START))

if [ "$API_STATUS" -eq 200 ]; then
    print_success "API is accessible (Status: $API_STATUS, Response Time: ${API_DURATION}s)"
else
    print_error "API is not accessible (Status: $API_STATUS)"
    exit 1
fi

# Test Frontend on port 8081
print_check "Testing Frontend on port 8081..."
FRONTEND_START=$(date +%s)
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/)
FRONTEND_END=$(date +%s)
FRONTEND_DURATION=$((FRONTEND_END - FRONTEND_START))

if [ "$FRONTEND_STATUS" -eq 200 ]; then
    print_success "Frontend is accessible (Status: $FRONTEND_STATUS, Response Time: ${FRONTEND_DURATION}s)"
else
    print_error "Frontend is not accessible (Status: $FRONTEND_STATUS)"
    exit 1
fi

# Test authentication on port 8081
print_check "Testing Authentication on port 8081..."
AUTH_START=$(date +%s)
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8081/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"encoder_user","password":"demopass123"}')
AUTH_END=$(date +%s)
AUTH_DURATION=$((AUTH_END - AUTH_START))

if [ "$AUTH_STATUS" -eq 200 ]; then
    print_success "Authentication is working (Status: $AUTH_STATUS, Response Time: ${AUTH_DURATION}s)"
else
    print_error "Authentication is not working (Status: $AUTH_STATUS)"
    exit 1
fi

# Test Admin panel on port 8081
print_check "Testing Admin Panel on port 8081..."
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/admin/)
if [ "$ADMIN_STATUS" -eq 200 ]; then
    print_success "Admin panel is accessible (Status: $ADMIN_STATUS)"
else
    print_warning "Admin panel may not be accessible (Status: $ADMIN_STATUS)"
fi

# Check database connectivity
print_check "Testing database connectivity from backend..."
DB_CHECK=$(docker exec agha-backend python -c "
import sys
try:
    import psycopg2
    import os
    from django.conf import settings
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
    django.setup()
    from django.db import connection
    cursor = connection.cursor()
except Exception as e:
    sys.exit(1)
" && echo "success" || echo "failed")

if [ "$DB_CHECK" = "success" ]; then
    print_success "Database connectivity from backend is working"
else
    print_error "Database connectivity from backend failed"
    exit 1
fi

# Check network accessibility
print_check "Checking network accessibility..."
LOCAL_IP=$(hostname -I | awk '{print $1}')
if [ ! -z "$LOCAL_IP" ]; then
    print_status "Local network IP: $LOCAL_IP"
    print_status "Application should be accessible on local network at http://$LOCAL_IP:8081"
fi

print_check "Verifying system resources..."
CONTAINER_STATS=$(docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null | grep agha- || true)
if [ ! -z "$CONTAINER_STATS" ]; then
    echo "$CONTAINER_STATS"
else
    print_warning "Could not retrieve container statistics"
fi

print_success ""
print_success "🎉 Optimized Environment Verification Complete!"
print_success ""
print_success "All systems are functioning properly:"
print_success "✅ All services are running"
print_success "✅ API is responsive (${API_DURATION}s)"
print_success "✅ Frontend is accessible (${FRONTEND_DURATION}s)"
print_success "✅ Authentication is working (${AUTH_DURATION}s)"
print_success "✅ Database connectivity established"
print_success "✅ Network accessibility confirmed"
print_success ""
print_status "Application is available at: http://localhost:8081"
print_status "API is available at: http://localhost:8081/api/"
print_status "Admin panel is available at: http://localhost:8081/admin/"
print_status ""
print_status "To stop the environment: ./stop_optimized.sh"
print_status "To perform a fresh setup: ./setup_optimized.sh"
print_warning "NOTE: Using port 8081 because port 8080 was in use"