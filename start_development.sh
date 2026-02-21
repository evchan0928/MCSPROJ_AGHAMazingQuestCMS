#!/bin/bash

# AGHAMazingQuestCMS - Venv-only Development Startup Script
# This script starts the development servers without Docker

echo "==========================================="
echo "AGHAMazingQuestCMS - Venv-only Development Startup"
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

echo "All prerequisites seem to be met."

echo ""
echo "Starting the backend server..."
echo "Note: This assumes you have already run the setup script and have a virtual environment configured."
echo ""

read -p "Do you want to start the backend server on port 8001? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Start backend in background
    cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend
    source venv/bin/activate
    python manage.py runserver 8001 &
    BACKEND_PID=$!
    echo "Backend started with PID $BACKEND_PID"
fi

echo ""
read -p "Do you want to start the frontend server? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Start frontend in background
    cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/frontend
    echo "Starting frontend server..."
    echo "Note: If this fails due to missing dependencies, run 'npm install' in the frontend directory first."
    npm start
fi

echo ""
echo "==========================================="
echo "Development servers are now running!"
echo ""
echo "Backend API available at: http://localhost:8001/api/"
echo "Frontend available at: http://localhost:3000"
echo "API Documentation (Swagger) at: http://localhost:8001/api/swagger/"
echo ""
echo "Press Ctrl+C to stop the servers"
echo "==========================================="