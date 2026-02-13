#!/bin/bash

# AGHAMazingQuestCMS Full Stack Startup Script
# This script starts all services for the full stack application

echo "Starting AGHAMazingQuestCMS Full Stack Application..."
echo "====================================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Step 1: Starting backend services (PostgreSQL, pgAdmin, Backend API, Frontend)..."
cd "$SCRIPT_DIR/devops" && docker compose -f docker-compose-fullstack.yml up -d

echo "Step 2: Waiting for backend services to be ready..."
sleep 10

echo "Step 3: Starting nginx reverse proxy..."
cd "$SCRIPT_DIR/devops" && docker compose -f docker-compose-nginx-only.yml up -d

echo ""
echo "Full Stack Application Started Successfully!"
echo "============================================="
echo ""
echo "NOTICE ABOUT ACCESS PORT:"
echo "-------------------------"
echo "The application should be accessible at: http://localhost:8080"
echo "HOWEVER, if port 8080 is in use by another service (e.g. system nginx),"
echo "the application will be available at: http://localhost:8081"
echo ""
echo "If you're getting 'address already in use' errors, you may need to:"
echo "1. Stop the system nginx service: sudo systemctl stop nginx"
echo "2. Then restart this application stack"
echo ""
echo "Current access point:"
if nc -z localhost 8080; then
    echo "- Main Application: http://localhost:8080"
else
    echo "- Main Application: http://localhost:8081 (port 8080 in use by another service)"
fi
echo ""
echo "Key endpoints:"
if nc -z localhost 8080; then
    echo "- Frontend UI: http://localhost:8080"
    echo "- API: http://localhost:8080/api/"
    echo "- API Login: http://localhost:8080/api/auth/login/"
    echo "- Admin Panel: http://localhost:8080/admin/"
else
    echo "- Frontend UI: http://localhost:8081"
    echo "- API: http://localhost:8081/api/"
    echo "- API Login: http://localhost:8081/api/auth/login/"
    echo "- Admin Panel: http://localhost:8081/admin/"
fi
echo ""
echo "Individual service endpoints (for debugging):"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- Database Admin: http://localhost:5050"
echo ""
echo "To stop the application, run: docker compose -f devops/docker-compose-fullstack.yml down && docker compose -f devops/docker-compose-nginx-only.yml down"
echo ""

# Show the running containers
echo "Running containers:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"