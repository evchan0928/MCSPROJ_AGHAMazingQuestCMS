#!/bin/bash

echo "Starting Agha Amazing Quest CMS development services..."

# Navigate to the project directory
cd "$(dirname "$0")"

echo "Step 1: Ensuring all previous containers are stopped..."
docker compose down

echo "Step 2: Building and starting services with custom DB port..."
DB_PORT=5433 docker compose up db backend frontend --build -d

echo "Step 3: Waiting for services to start..."
sleep 10

echo "Step 4: Checking running containers..."
docker ps

echo "Services started successfully!"
echo ""
echo "Access the application at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- Database: localhost:5433 (for direct connections)"
echo ""
echo "For development, you can monitor logs with:"
echo "docker compose logs -f backend"