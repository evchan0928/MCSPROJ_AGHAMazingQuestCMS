#!/bin/bash
# Improved setup script for AGHAMazingQuestCMS

set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting AGHAMazingQuestCMS Setup..."

# Load environment variables
if [ -f config/environments/.env ]; then
    export $(cat config/environments/.env | xargs)
    echo "✅ Loaded environment variables"
else
    echo "⚠️  Environment file not found at config/environments/.env"
    echo "   Using default environment settings"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Stop any existing services
echo "🛑 Stopping existing services..."
docker-compose down || true

# Build and start services
echo "🐳 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 20

# Run database migrations
echo "🔧 Running database migrations..."
docker-compose exec backend python manage.py migrate

# Create a superuser if one doesn't exist
echo "🔑 Ensuring superuser account exists..."
docker-compose exec backend python create_admin_user.py

echo "✅ Superuser account ensured"

echo "🌟 AGHAMazingQuestCMS is now running!"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000/api/"
echo "   Admin Panel: http://localhost:8000/admin/"
echo "   Portainer: http://localhost:9000"
echo "   pgAdmin: http://localhost:5050"
echo ""
