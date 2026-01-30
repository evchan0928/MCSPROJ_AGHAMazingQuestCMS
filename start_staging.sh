#!/bin/bash

# Script to start the application in staging mode
# Usage: ./start_staging.sh

echo "Starting AGHAMazingQuestCMS in staging mode..."

# Function to check if a port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use."
        read -p "Do you want to kill the process using port $1? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            lsof -ti:$1 | xargs kill -9 2>/dev/null
            echo "Process on port $1 killed."
        else
            echo "Please free up port $1 before continuing."
            exit 1
        fi
    fi
}

# Check if backend port is available
check_port 8080

# Start backend in background
echo "Starting backend server..."
cd /home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS
python manage.py runserver 0.0.0.0:8080 > /tmp/backend_staging.log 2>&1 &
BACKEND_PID=$!

echo "Backend server started with PID: $BACKEND_PID"

# Wait a moment for the backend to initialize
sleep 3

# Check if frontend port is available
check_port 3000

# Start frontend in background
echo "Starting frontend server..."
cd /home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS/frontend
npm start > /tmp/frontend_staging.log 2>&1 &
FRONTEND_PID=$!

echo "Frontend server started with PID: $FRONTEND_PID"

# Show staging environment info
IP_ADDR=$(hostname -I | awk '{print $1}')
echo ""
echo "==========================================="
echo "AGHAMazingQuestCMS - STAGING ENVIRONMENT"
echo "==========================================="
echo "Backend:  http://$IP_ADDR:8080/"
echo "Frontend:   http://$IP_ADDR:3000/"
echo "Admin:      http://$IP_ADDR:8080/admin/"
echo "API:        http://$IP_ADDR:8080/api/"
echo "==========================================="
echo ""
echo "Press Ctrl+C to stop the staging environment"
echo ""

# Wait for user to press Ctrl+C
wait