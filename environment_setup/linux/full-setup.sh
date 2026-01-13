#!/usr/bin/env bash

# Complete setup script for AGHAMazingQuestCMS on Ubuntu Linux
# This script installs system dependencies and sets up the project

set -e  # Exit on any error

echo "==========================================="
echo "Complete AGHAMazingQuestCMS Setup for Ubuntu Linux"
echo "==========================================="

# Ask user if they want to install system dependencies
read -p "Do you want to install system dependencies? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installing system dependencies..."
    ./environment_setup/linux/install-dependencies.sh
    echo "System dependencies installed."
else
    echo "Skipping system dependencies installation."
fi

# Check if virtual environment exists
if [ ! -d "./venv" ]; then
    echo "Virtual environment does not exist. Creating one..."
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

# Install python-dotenv
pip install python-dotenv

# Check if .env file exists, copy from .env.example if it doesn't
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "Please review and customize the .env file as needed."
fi

# Make sure entrypoint script is executable
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

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "==========================================="
echo "Setup completed successfully!"
echo "==========================================="
echo ""
echo "To start the Django development server:"
echo "  source venv/bin/activate"
echo "  python manage.py runserver"
echo ""
echo "To start the React frontend (in a separate terminal):"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:3000"
echo "  Django Admin: http://127.0.0.1:8000/admin/"
echo "  Wagtail Admin: http://127.0.0.1:8000/wagtail/"
echo ""
echo "Default credentials:"
echo "  Username: admin"
echo "  Password: admin123"