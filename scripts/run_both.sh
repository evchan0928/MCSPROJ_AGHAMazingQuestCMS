#!/bin/bash
# Script to run both frontend and backend servers simultaneously

echo "🚀 Starting AGHAMazingQuestCMS - Full Stack Development Server"
echo "==============================================================="
echo "Backend: http://127.0.0.1:8000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to handle cleanup when script exits
cleanup() {
    echo -e "\n🛑 Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "👋 Servers stopped. Goodbye!"
    exit 0
}

# Set up signal trapping for graceful shutdown
trap cleanup SIGINT SIGTERM

# Activate virtual environment
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS
source venv/bin/activate

# Start the backend server in the background
echo "🔌 Starting Backend Server (Django/Wagtail)..."
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS
python manage.py runserver 127.0.0.1:8000 &
BACKEND_PID=$!

# Small delay to let the backend start
sleep 3

# Start the frontend server in the background
echo "🌐 Starting Frontend Server (React)..."
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/frontend

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
fi

npm start &
FRONTEND_PID=$!

# Wait for both processes
echo "✅ Both servers are running!"
echo "Backend: http://127.0.0.1:8000"
echo "Frontend: http://localhost:3000"
echo "Communication between them is enabled via CORS"
echo ""

# Wait in the background for both processes
wait $BACKEND_PID $FRONTEND_PID

# Cleanup when done
cleanup