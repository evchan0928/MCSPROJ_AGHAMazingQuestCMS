#!/bin/bash

# Full Stack Development Setup Script
# This script starts both the Django backend and React frontend servers

set -e  # Exit immediately if a command exits with a non-zero status

echo "==========================================="
echo "AHA Amazing Quest CMS - Full Stack Setup"
echo "==========================================="

# Check if running in venv
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Activating virtual environment..."
    source backend/venv/bin/activate
    echo "Virtual environment activated."
fi

# Check if ports are available
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null || lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
    echo "ERROR: Port 8000 or 3000 is already in use. Please stop the processes first."
    echo "Run: lsof -ti:8000 | xargs kill and lsof -ti:3000 | xargs kill"
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")"

echo "Starting full stack application..."
echo ""

# Start Docker services (database and pgAdmin)
echo "Starting Docker services (PostgreSQL and pgAdmin)..."
docker compose up -d db pgadmin
echo "Docker services started."

# Wait for database to be ready
echo "Waiting for database to be ready..."
timeout 30 bash -c 'until docker exec mcsproj_aghamazingquestcms-db-1 pg_isready > /dev/null 2>&1; do sleep 1; done'
echo "Database is ready."

# Run Django migrations
echo "Running Django migrations..."
cd backend
python manage.py migrate --settings=config.settings.docker_db
echo "Migrations completed."

# Start backend (Django) in background
echo "Starting Django backend server on port 8000..."
nohup python manage.py runserver 0.0.0.0:8000 --settings=config.settings.docker_db > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"

# Wait a moment for backend to start
sleep 3

# Start frontend (React) in background
echo "Starting React frontend server on port 3000..."
cd ../frontend
nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID $FRONTEND_PID"

echo ""
echo "==========================================="
echo "Application is now running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "pgAdmin: http://localhost:5050 (login: admin@admin.com / admin)"
echo "PostgreSQL: localhost:5432 (user: postgres / password: admin)"
echo ""
echo "Valid login credentials:"
echo "- Username: admin"
echo "- Password: admin123"
echo "- Email: admin@example.com"
echo ""
echo "To stop the application, run: ./stop_services.sh"
echo "==========================================="

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID