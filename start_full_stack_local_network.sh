#!/bin/bash
# Script to start both backend and frontend servers accessible from local network

echo "Starting full stack for local network access..."

# Start backend server in the background
echo "Starting backend server on port 8000..."
cd /home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# Give backend a moment to start
sleep 3

# Start frontend server in the background
echo "Starting frontend server on port 3000..."
cd /home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/frontend
npm start &
FRONTEND_PID=$!

# Function to stop servers on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Trap exit signal to clean up
trap cleanup EXIT INT TERM

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID