#!/usr/bin/env bash

# Setup script for AGHAMazingQuestCMS on Linux systems
# This script sets up the development environment for the project

set -e  # Exit on any error

echo "Setting up AGHAMazingQuestCMS development environment on Linux..."

# Check if Python 3.11 is installed
if ! command -v python3.11 &> /dev/null; then
    echo "Error: Python 3.11 is not installed."
    echo "Install it using: sudo apt update && sudo apt install python3.11 python3.11-venv python3.11-dev"
    exit 1
fi

# Check if pip is available
if ! command -v pip &> /dev/null; then
    echo "Installing pip..."
    python3.11 -m ensurepip --upgrade
fi

# Create virtual environment if it doesn't exist
if [ ! -d "./venv" ]; then
    echo "Creating virtual environment..."
    python3.11 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source ./venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install python-dotenv for environment variable handling
pip install python-dotenv

# Check if .env file exists, copy from .env.example if it doesn't
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "Please review and customize the .env file as needed."
fi

# Make entrypoint script executable
echo "Making entrypoint script executable..."
chmod +x docker/entrypoint.sh

# Run Django migrations
echo "Running Django migrations..."
python manage.py migrate

# Check if superuser exists
echo "Checking for superuser..."
if ! python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print('Superuser exists' if User.objects.filter(is_superuser=True).exists() else 'No superuser')" 2>/dev/null | grep -q "No superuser"; then
    echo "Creating superuser account..."
    export DJANGO_SUPERUSER_PASSWORD="admin123"
    python manage.py createsuperuser --username admin --email admin@example.com --noinput
    unset DJANGO_SUPERUSER_PASSWORD
    echo "Created superuser with username 'admin' and password 'admin123'"
else
    echo "Superuser already exists."
fi

# Create required roles
echo "Creating content roles..."
python manage.py create_content_roles

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo ""
echo "Setup completed successfully!"
echo ""
echo "To start the Django development server:"
echo "  source venv/bin/activate"
echo "  python manage.py runserver"
echo ""
echo "To start the React frontend (in a separate terminal):"
echo "  cd frontend"
echo "  npm install"
echo "  npm start"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:3000"
echo "  Django Admin: http://127.0.0.1:8000/admin/"
echo "  Wagtail Admin: http://127.0.0.1:8000/admin/"
echo ""
echo "Default credentials:"
echo "  Username: admin"
echo "  Password: admin123"