#!/bin/bash

# AGHAMazingQuestCMS - Full Stack Development Setup Script
# This script automates the initial setup for the full-stack development environment

set -e  # Exit immediately if a command exits with a non-zero status

echo "==========================================="
echo "AGHAMazingQuestCMS - Full Stack Setup Script"
echo "==========================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists git; then
    echo "ERROR: git is not installed. Please install git first."
    exit 1
fi

if ! command_exists python3; then
    echo "ERROR: python3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

if ! command_exists npm; then
    echo "ERROR: npm is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists psql; then
    echo "WARNING: PostgreSQL client (psql) is not installed or not in PATH."
    echo "Please ensure PostgreSQL 12+ is installed and running before continuing."
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

echo "All prerequisites seem to be met."

# Create backend virtual environment
echo ""
echo "Setting up backend Python virtual environment..."
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Virtual environment created."
else
    echo "Virtual environment already exists."
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create backend .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cat > .env << EOF
# Database Configuration
DB_NAME=aghamazing_db
DB_USER=cms_user
DB_PASSWORD=secure_password123
DB_HOST=localhost
DB_PORT=5432

# Django Configuration
DJANGO_SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:8001

# JWT Configuration
JWT_SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
EOF
    echo "Backend .env file created with random keys."
else
    echo "Backend .env file already exists."
fi

# Run backend migrations
echo "Running backend migrations..."
python manage.py migrate

# Prompt for superuser creation
echo ""
read -p "Would you like to create a superuser account now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
fi

# Return to root directory
cd ..

# Setup frontend
echo ""
echo "Setting up frontend..."
cd frontend

# Create frontend .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cat > .env << EOF
# Backend API URL
REACT_APP_BACKEND_API_URL=http://localhost:8001

# WebSocket URL (if applicable)
REACT_APP_WS_URL=ws://localhost:8001/ws

# Other environment variables
GENERATE_SOURCEMAP=false
EOF
    echo "Frontend .env file created."
else
    echo "Frontend .env file already exists."
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

echo ""
echo "==========================================="
echo "Setup completed successfully!"
echo "==========================================="
echo ""
echo "To run the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python manage.py runserver 8001"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "The application will be available at http://localhost:3000"
echo "The backend API will be available at http://localhost:8001/api/"
echo "API documentation at http://localhost:8001/api/swagger/"
echo "==========================================="