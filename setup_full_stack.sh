#!/bin/bash

# Full Stack Setup Script for AGHAMazingQuestCMS
# Sets up and starts the complete system: backend, frontend, and verifies connections
# Author: Professional Development Team
# Description: This script sets up the complete development environment for AGHAMazingQuestCMS

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}AGHAMazingQuestCMS Full Stack Setup${NC}"
echo -e "${BLUE}================================${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on a supported platform
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="macos"
else
    print_warning "Unsupported platform: $OSTYPE, attempting to continue anyway"
    PLATFORM="other"
fi

print_status "Detected platform: $PLATFORM"

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Python 3 is installed
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.9+"
        exit 1
    fi
    
    # Check if pip is installed
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 is not installed. Please install pip"
        exit 1
    fi
    
    # Check if virtual environment is available
    if ! python3 -c "import venv" &> /dev/null; then
        print_error "Python venv module is not available"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed. Frontend will not be available."
        FRONTEND_AVAILABLE=false
    else
        # Check Node.js version
        NODE_VERSION=$(node --version | sed 's/v//')
        MIN_NODE_VERSION=16
        if (( $(echo "$NODE_VERSION < $MIN_NODE_VERSION" | bc -l 2>/dev/null || echo 1) )); then
            print_warning "Node.js version is too low. Minimum required: $MIN_NODE_VERSION, Found: $NODE_VERSION"
            FRONTEND_AVAILABLE=false
        else
            FRONTEND_AVAILABLE=true
        fi
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null && [ "$FRONTEND_AVAILABLE" = true ]; then
        print_warning "npm is not installed. Frontend will not be available."
        FRONTEND_AVAILABLE=false
    fi
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "git is not installed. Please install git"
        exit 1
    fi
    
    print_status "All prerequisites checked successfully"
}

# Function to setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Create or update virtual environment
    if [ -d "venv" ]; then
        print_status "Virtual environment already exists, updating..."
        source venv/bin/activate
        pip install --upgrade pip
    else
        print_status "Creating virtual environment..."
        python3 -m venv venv
        source venv/bin/activate
        pip install --upgrade pip
    fi
    
    # Install Python dependencies
    print_status "Installing Python dependencies..."
    pip install -r ../requirements.txt
    
    # Run Django migrations
    print_status "Running Django migrations..."
    python manage.py migrate
    
    # Collect static files
    print_status "Collecting static files..."
    python manage.py collectstatic --noinput
    
    # Create superuser if doesn't exist (optional)
    print_status "Backend setup completed"
    
    cd ..
}

# Function to setup frontend
setup_frontend() {
    if [ "$FRONTEND_AVAILABLE" = false ]; then
        print_warning "Skipping frontend setup - prerequisites not met"
        return
    fi
    
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install Node.js dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    cd ..
}

# Function to verify database connection
verify_db_connection() {
    print_status "Verifying database connection..."
    
    cd backend
    source venv/bin/activate
    
    # Test database connection
    if python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base'); import django; django.setup(); from django.db import connection; connection.cursor()"; then
        print_status "Database connection successful"
    else
        print_error "Database connection failed"
        print_warning "If using Neon database:"
        print_warning "- Ensure your database is active in the Neon Console"
        print_warning "- Grant permissions: GRANT CREATE ON SCHEMA public TO neondb_owner;"
        print_warning "- Check that sslmode=require is in your DATABASE_URL"
        exit 1
    fi
    
    cd ..
}

# Function to start backend server
start_backend() {
    print_status "Starting backend server..."
    
    cd backend
    source venv/bin/activate
    
    # Start Django development server in the background
    python manage.py runserver 0.0.0.0:8000 &
    BACKEND_PID=$!
    cd ..
    
    # Wait a bit for the server to start
    sleep 3
    
    # Check if the server is running
    if ps -p $BACKEND_PID > /dev/null; then
        print_status "Backend server started successfully (PID: $BACKEND_PID)"
        echo $BACKEND_PID > backend_pid.txt
    else
        print_error "Failed to start backend server"
        exit 1
    fi
}

# Function to start frontend server
start_frontend() {
    if [ "$FRONTEND_AVAILABLE" = false ]; then
        print_warning "Skipping frontend start - not available"
        return
    fi
    
    print_status "Starting frontend server..."
    
    cd frontend
    
    # Start React development server in the background
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    # Wait a bit for the server to start
    sleep 3
    
    # Check if the server is running
    if ps -p $FRONTEND_PID > /dev/null; then
        print_status "Frontend server started successfully (PID: $FRONTEND_PID)"
        echo $FRONTEND_PID >> frontend_pid.txt
    else
        print_error "Failed to start frontend server"
        # Not exiting here as backend might still be usable
    fi
}

# Function to display running services
display_services() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}Services Running${NC}"
    echo -e "${BLUE}================================${NC}"
    echo -e "${GREEN}Backend:${NC} http://localhost:8000"
    echo -e "${GREEN}API Docs:${NC} http://localhost:8000/api/"  # Swagger/Redoc
    echo -e "${GREEN}Admin:${NC} http://localhost:8000/admin/"
    
    if [ "$FRONTEND_AVAILABLE" = true ]; then
        echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
    fi
    
    echo ""
    echo -e "${YELLOW}To stop services, run: ./stop_services.sh${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to save service PIDs
save_service_pids() {
    # Save backend PID
    if [ -f backend_pid.txt ]; then
        BACKEND_PID=$(cat backend_pid.txt)
        echo "BACKEND_PID=$BACKEND_PID" > services.conf
    fi
    
    # Save frontend PID
    if [ -f frontend_pid.txt ]; then
        FRONTEND_PID=$(cat frontend_pid.txt)
        echo "FRONTEND_PID=$FRONTEND_PID" >> services.conf
    fi
}

# Main execution
main() {
    check_prerequisites
    setup_backend
    if [ "$FRONTEND_AVAILABLE" = true ]; then
        setup_frontend
    fi
    # Run Django migrations
    print_status "Running Django migrations..."
    cd backend
    source venv/bin/activate
    
    if python manage.py migrate; then
        print_status "Migrations completed successfully"
    else
        print_error "Failed to run Django migrations"
        print_warning "If using Neon database:"
        print_warning "- Ensure your database is active in the Neon Console"
        print_warning "- Grant permissions: GRANT CREATE ON SCHEMA public TO neondb_owner;"
        print_warning "- Check that sslmode=require is in your DATABASE_URL"
        exit 1
    fi
    
    cd ..
    start_backend
    if [ "$FRONTEND_AVAILABLE" = true ]; then
        start_frontend
    fi
    save_service_pids
    display_services
    
    echo ""
    print_status "Full stack setup completed successfully!"
    print_status "System is ready for development."
}

# Run the main function
main "$@"