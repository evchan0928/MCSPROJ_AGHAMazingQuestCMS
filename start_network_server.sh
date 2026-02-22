#!/bin/bash

# Script to start Django development server accessible from local network
# This will bind the server to all network interfaces (0.0.0.0) instead of just localhost

echo "Starting Django server accessible from local network..."
echo "Loading environment variables..."

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Activate virtual environment and start Django server
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend

echo "Activating virtual environment..."
source ../venv/bin/activate

echo "Starting Django development server on all interfaces (0.0.0.0:8000)..."
echo "Server will be accessible from other devices on your local network at: http://$(hostname -I | awk '{print $1}'):8000"
echo "Press Ctrl+C to stop the server"

python manage.py runserver 0.0.0.0:8000