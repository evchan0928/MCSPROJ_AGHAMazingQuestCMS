#!/bin/bash
# Script to start the backend server accessible from local network

echo "Starting backend server accessible from local network..."

# Navigate to backend directory
cd /home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/backend

# Activate virtual environment
source venv/bin/activate

# Run the Django development server bound to all interfaces
echo "Starting Django server on 0.0.0.0:8000..."
python manage.py runserver 0.0.0.0:8000