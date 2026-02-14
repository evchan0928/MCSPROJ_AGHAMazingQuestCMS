#!/bin/bash

# AGHAMazingQuestCMS - Optimized Setup Script
# This script automates the setup of the full-stack application with optimized configurations

set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting AGHAMazingQuestCMS Optimized Setup..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Navigate to the devops directory
cd "$(dirname "$0")/devops" || exit

echo "🔧 Building and starting the application stack..."
docker compose -f docker-compose-fullstack.yml up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 15

# Run Django migrations
echo "📦 Running database migrations..."
docker exec agha-backend python manage.py migrate

# Populate sample data
echo "📊 Populating sample data..."
docker exec agha-backend python manage.py populate_sample_data

# Collect static files
echo "📚 Collecting static files..."
docker exec agha-backend python manage.py collect_statics

echo "✅ Application setup completed successfully!"
echo ""
echo "📋 Access Information:"
echo "   Main Application: http://localhost:8081"
echo "   Sign-In Page: http://localhost:8081/signin"
echo "   API Documentation: http://localhost:8081/api/swagger/"
echo "   Django Admin: http://localhost:8081/admin/"
echo "   pgAdmin: http://localhost:5050"
echo ""
echo "🔑 Default Demo User Credentials:"
echo "   Username: demo_user | Password: demopass123"
echo "   Username: encoder_user | Password: demopass123"
echo "   Username: editor_user | Password: demopass123"
echo "   Username: approver_user | Password: demopass123"
echo "   Username: admin_user | Password: demopass123"
echo "   Username: superadmin | Password: superadmin123"
echo ""
echo "🔐 pgAdmin Credentials:"
echo "   Email: aghamazingdost@gmail.com"
echo "   Password: DOSTAGHAMazingQuestAdmin1234"
echo ""
echo "💡 Pro Tip: Visit the sign-in page to experience the new clean, responsive design!"
