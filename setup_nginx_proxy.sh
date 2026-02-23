#!/bin/bash
# AGHAMazingQuestCMS Nginx Proxy Setup Script

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Starting Nginx Proxy Setup for AGHAMazingQuestCMS"

# Build the React frontend
print_status "Building React frontend..."
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/frontend

# Install dependencies if not already installed
npm install

# Build the production-ready app
print_status "Creating production build of React app..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Failed to build React frontend"
    exit 1
fi

print_success "React frontend built successfully"

# Create staticfiles directory for Django if it doesn't exist
print_status "Preparing Django static files directory..."
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend

# Collect static files for Django admin and other static assets
source venv/bin/activate
python manage.py collectstatic --noinput

if [ $? -ne 0 ]; then
    print_error "Failed to collect Django static files"
    exit 1
fi

print_success "Django static files collected"

# Create nginx configuration
print_status "Setting up Nginx configuration..."

# Copy our configuration to sites-available
sudo cp /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/nginx-agha-proxy.conf /etc/nginx/sites-available/agha-cms

# Enable the site by creating a symlink
sudo ln -sf /etc/nginx/sites-available/agha-cms /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

if [ $? -ne 0 ]; then
    print_error "Nginx configuration test failed"
    exit 1
fi

print_success "Nginx configuration is valid"

# Restart nginx to apply the new configuration
print_status "Restarting Nginx service..."
sudo systemctl restart nginx

if [ $? -ne 0 ]; then
    print_error "Failed to restart Nginx service"
    exit 1
fi

print_success "Nginx service restarted successfully"

# Stop any running development servers
print_status "Stopping development servers..."
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS
./stop_services.sh || true

# Start the backend server in the background
print_status "Starting Django backend server..."
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend
source venv/bin/activate
python manage.py runserver 127.0.0.1:8000 &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 3

# Verify backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    print_error "Failed to start Django backend server"
    exit 1
fi

print_success "Django backend server started on 127.0.0.1:8000"

# Set up trap to stop backend server on script exit
trap "kill $BACKEND_PID 2>/dev/null; print_status 'Backend server stopped'; exit 0" EXIT INT TERM

print_success "Nginx reverse proxy setup completed successfully!"
echo ""
echo "Access the application at: http://localhost:8080"
echo ""
echo "Nginx is now configured to:"
echo "  - Serve the React frontend from /"
echo "  - Proxy API requests from /api to Django backend (127.0.0.1:8000)"
echo "  - Proxy admin requests from /admin to Django backend (127.0.0.1:8000)"
echo "  - Serve static files from /static/"
echo "  - Serve media files from /media/"
echo ""
echo "To stop the backend server, press Ctrl+C or run: kill $BACKEND_PID"