#!/bin/bash
# Comprehensive setup script for the AGHAMazing Quest CMS ecosystem
# This script installs all necessary dependencies for the full-stack application

set -e  # Exit immediately if a command exits with a non-zero status

echo "==========================================="
echo "AGHAMazing Quest CMS - Ecosystem Setup"
echo "==========================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

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

# Check for essential tools
print_status "Checking for essential tools..."

if command_exists python3; then
    print_success "Python 3 is installed"
else
    print_error "Python 3 is not installed. Please install it first."
    exit 1
fi

if command_exists pip; then
    print_success "Pip is installed"
else
    print_error "Pip is not installed. Please install it first."
    exit 1
fi

if command_exists flutter; then
    print_success "Flutter is installed"
else
    print_error "Flutter is not installed. Please install it first."
    exit 1
fi

if command_exists dart; then
    print_success "Dart is installed"
else
    print_error "Dart is not installed. Please install it first."
    exit 1
fi

if command_exists node; then
    print_success "Node.js is installed"
else
    print_error "Node.js is not installed. Please install it first."
    exit 1
fi

if command_exists npm; then
    print_success "NPM is installed"
else
    print_error "NPM is not installed. Please install it first."
    exit 1
fi

if command_exists docker; then
    print_success "Docker is installed"
else
    print_error "Docker is not installed. Please install it first."
    exit 1
fi

if command_exists docker-compose; then
    print_success "Docker Compose is installed"
else
    print_error "Docker Compose is not installed. Please install it first."
    exit 1
fi

print_status "Setting up Python virtual environment for backend..."
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend

if [ -d "venv" ]; then
    print_status "Virtual environment already exists. Activating..."
else
    print_status "Creating new virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

print_status "Running Django migrations..."
python manage.py migrate

print_status "Checking Django configuration..."
python manage.py check

print_status "Installing Flutter dependencies..."
cd ../aghamazingflutter-master
flutter pub get

print_status "Validating Flutter installation..."
flutter doctor

print_status "Setting up environment files..."

# Backend environment file
if [ ! -f "../backend/.env" ]; then
    print_status "Creating backend .env file..."
    cat > ../backend/.env << EOF
DEBUG=True
DJANGO_SECRET_KEY=your-super-secret-key-change-this-in-production
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
ALLOWED_HOSTS=localhost,127.0.0.1,[::1]
EOF
    print_success "Backend .env file created"
else
    print_status "Backend .env file already exists"
fi

print_status "Setup complete!"
echo ""
echo "==========================================="
echo "ECOSYSTEM SETUP SUMMARY"
echo "==========================================="
echo "Backend (Django):"
echo "  - Virtual environment: venv"
echo "  - Dependencies installed"
echo "  - Database migrated"
echo "  - Configuration validated"
echo ""
echo "Frontend (Flutter):"
echo "  - Dependencies installed"
echo "  - Validated"
echo ""
echo "To start the backend: cd backend && source venv/bin/activate && python manage.py runserver"
echo "To start the frontend: cd aghamazingflutter-master && flutter run"
echo "==========================================="