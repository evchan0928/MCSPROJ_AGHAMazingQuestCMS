#!/bin/bash
# Startup script for the AGHAMazing Quest CMS ecosystem
# This script starts both the backend and frontend services

set -e  # Exit immediately if a command exits with a non-zero status

echo "==========================================="
echo "Starting AGHAMazing Quest CMS Ecosystem"
echo "==========================================="

# Function to print colored output
print_status() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Start the backend server
start_backend() {
    print_status "Starting Django backend server..."
    cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend
    source venv/bin/activate
    python manage.py runserver 8000 &
    BACKEND_PID=$!
    print_success "Backend server started with PID $BACKEND_PID"
}

# Start the frontend (this would normally be done in a separate terminal)
start_frontend_instructions() {
    print_status "To start the Flutter frontend:"
    echo "  1. Open a new terminal"
    echo "  2. Run: cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/aghamazingflutter-master"
    echo "  3. Run: flutter run"
    echo ""
}

# Check if backend is running
check_backend() {
    sleep 5  # Wait a bit for the server to start
    if curl -s http://localhost:8000/api/ > /dev/null; then
        print_success "Backend is accessible at http://localhost:8000"
    else
        print_error "Backend is not accessible at http://localhost:8000"
    fi
}

# Main execution
start_backend
start_frontend_instructions
check_backend

echo ""
echo "==========================================="
echo "ECOSYSTEM STARTUP COMPLETE"
echo "==========================================="
echo "Backend: http://localhost:8000"
echo "API Root: http://localhost:8000/api/"
echo "Admin: http://localhost:8000/admin/"
echo ""
echo "To stop the backend server, run: kill $BACKEND_PID"
echo "==========================================="