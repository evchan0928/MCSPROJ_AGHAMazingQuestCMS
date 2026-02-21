#!/bin/bash

# AGHAMazingQuestCMS - Optimized CMS-only Development Startup Script
# This script starts only the CMS components in venv environment

echo "==========================================="
echo "AGHAMazingQuestCMS - Optimized CMS-only Startup"
echo "==========================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists python3; then
    echo "ERROR: python3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

if ! command_exists npm; then
    echo "ERROR: npm is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists psql; then
    echo "WARNING: PostgreSQL client (psql) is not installed or not in PATH."
    echo "Please ensure PostgreSQL 12+ is installed and running before continuing."
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

echo "All prerequisites seem to be met."

echo ""
echo "Starting the CMS backend server..."
echo ""

read -p "Do you want to start the CMS backend server on port 8001? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Start backend in background
    cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend
    source venv/bin/activate
    python manage.py runserver 8001 &
    BACKEND_PID=$!
    echo "CMS Backend started with PID $BACKEND_PID"
    CMS_BACKEND_STARTED=true
fi

echo ""
read -p "Do you want to start the CMS frontend server? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [[ "$CMS_BACKEND_STARTED" == true ]]; then
        echo "Starting CMS frontend server..."
        echo "Note: If this fails due to missing dependencies, run 'npm install' in the frontend directory first."
        cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/frontend
        npm start
    else
        echo "Warning: Backend server is not running. It's recommended to run the backend first."
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/frontend
            npm start
        fi
    fi
fi

echo ""
echo "==========================================="
echo "CMS-only development servers are now running!"
echo ""
echo "Backend API available at: http://localhost:8001/api/"
echo "Frontend CMS available at: http://localhost:3000"
echo "API Documentation (Swagger) at: http://localhost:8001/api/swagger/"
echo ""
echo "Available CMS Modules:"
echo "- Content Management"
echo "- User Management" 
echo "- Authentication"
echo "- Analytics"
echo ""
echo "Press Ctrl+C to stop the servers"
echo "==========================================="