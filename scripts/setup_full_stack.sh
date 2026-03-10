#!/bin/bash

# AGHAMazingQuestCMS Full Stack Setup Script
# Sets up and starts the complete application stack with proper service initialization

set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting AGHAMazingQuestCMS Full Stack Setup..."

# Verify we're on the correct branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "2.24.1-wip" ]]; then
    echo "❌ ERROR: Not on 2.24.1-wip branch. Please switch to the correct branch."
    exit 1
fi
echo "✅ On correct branch: $CURRENT_BRANCH"

# Verify virtual environment is active
if [[ -z "$VIRTUAL_ENV" ]]; then
    echo "❌ Virtual environment not active. Activating venv..."
    if [[ -d "venv" ]]; then
        source venv/bin/activate
        echo "✅ Virtual environment activated"
    else
        echo "❌ venv directory does not exist. Creating virtual environment..."
        python3 -m venv venv
        source venv/bin/activate
        pip install --upgrade pip
        echo "✅ Virtual environment created and activated"
    fi
else
    echo "✅ Virtual environment already active"
fi

# Check if node_modules exists, install if not
if [[ ! -d "frontend/node_modules" ]]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

# Check if requirements are installed in venv
if [[ ! -f "requirements_installed" ]] || [[ "backend/requirements.txt" -nt "requirements_installed" ]]; then
    echo "📦 Installing backend dependencies..."
    pip install -r backend/requirements.txt
    touch requirements_installed
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies already installed"
fi

# Stop any existing services
echo "🛑 Stopping any existing services..."
if [[ -f "stop_services.sh" ]]; then
    ./stop_services.sh || true
fi

# Wait a moment for ports to be released
sleep 2

# Check for port availability
echo "🔍 Checking port availability..."
for port in 8000 3000 5432 9000 5050; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo "⚠️  Port $port is in use. Attempting to free it..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done

echo "✅ Ports are available"

# Start Docker services
echo "🐳 Starting Docker services..."
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check if the backend service is running properly
if docker compose exec backend pg_isready &>/dev/null; then
    echo "✅ Backend service is ready"
else
    echo "⏳ Waiting more time for backend to initialize..."
    sleep 30
fi

# Run migrations if this is a fresh start
echo "🔧 Running database migrations..."
docker compose exec backend python manage.py migrate

# Create a superuser if one doesn't exist
echo "🔑 Ensuring superuser account exists..."
docker compose exec backend python create_admin_user.py

echo "✅ Superuser account ensured"

echo "🌟 AGHAMazingQuestCMS Full Stack is now running!"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000/api/"
echo "   Admin Panel: http://localhost:8000/admin/"
echo "   Portainer: http://localhost:9000"
echo "   pgAdmin: http://localhost:5050"
echo ""
echo "🔄 To stop the application, run: ./stop_services.sh"
echo ""

# Display service status
echo "📋 Service Status:"
docker compose ps