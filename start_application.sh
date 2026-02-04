#!/bin/bash

echo "Starting AGHAMazingQuestCMS Application..."
echo "=========================================="

# Function to start the backend server
start_backend() {
    echo "Starting backend server on http://localhost:8000..."
    cd /home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/backend
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Ensure migrations are applied
    echo "Applying migrations..."
    python manage.py migrate
    
    # Create the admin user if it doesn't exist
    echo "Ensuring admin user exists..."
    python manage.py shell -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()
from django.contrib.auth.models import User
admin_user, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@aghama.com',
        'is_staff': True,
        'is_superuser': True,
    }
)
admin_user.set_password('admin123')
admin_user.save()
print('Admin user created/updated with username admin and password admin123')
"
    
    # Start the Django development server
    echo "Starting Django server..."
    python manage.py runserver localhost:8000 &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
    
    # Wait for server to start
    sleep 5
    
    return $BACKEND_PID
}

# Function to start the frontend server
start_frontend() {
    echo "Starting frontend server on http://localhost:3000..."
    cd /home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install
    fi
    
    # Start the React development server
    echo "Starting React development server..."
    npm start &
    FRONTEND_PID=$!
    echo "Frontend started with PID: $FRONTEND_PID"
    
    return $FRONTEND_PID
}

# Start backend first
start_backend
BACKEND_PID=$(jobs -p %1)

# Wait for backend to fully start
sleep 8

# Start frontend
start_frontend
FRONTEND_PID=$(jobs -p %2)

echo ""
echo "=========================================="
echo "Application Started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Login: http://localhost:3000/ (username: admin, password: admin123)"
echo ""
echo "To access the application:"
echo "1. Open your browser and go to http://localhost:3000/"
echo "2. Enter username: admin"
echo "3. Enter password: admin123"
echo "4. Click 'Continue' to log in"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=========================================="

# Keep the script running
wait $BACKEND_PID $FRONTEND_PID
