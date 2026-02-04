#!/bin/bash

# Script to start all services for AGHAMazingQuestCMS

echo "Starting AGHAMazingQuestCMS Full Stack Services..."

# Start PostgreSQL and pgAdmin if not running
if [ "$(docker ps -q -f name=agha-postgres)" ]; then
    echo "PostgreSQL container is already running."
else
    if [ "$(docker ps -aq -f name=agha-postgres)" ]; then
        # Container exists but stopped, start it
        docker start agha-postgres
    else
        # Container doesn't exist, create and start
        docker run -d --name agha-postgres \
            -e POSTGRES_DB=aghamazing_db \
            -e POSTGRES_USER=admin \
            -e POSTGRES_PASSWORD=password123 \
            -p 5439:5432 \
            -v agha_postgres_data:/var/lib/postgresql/data \
            postgres:15
    fi
fi

if [ "$(docker ps -q -f name=agha-pgadmin)" ]; then
    echo "pgAdmin container is already running."
else
    if [ "$(docker ps -aq -f name=agha-pgadmin)" ]; then
        # Container exists but stopped, start it
        docker start agha-pgadmin
    else
        # Container doesn't exist, create and start
        docker run -d --name agha-pgadmin \
            -e PGADMIN_DEFAULT_EMAIL=admin@aghama.com \
            -e PGADMIN_DEFAULT_PASSWORD=admin1234 \
            -p 5050:80 \
            -v agha_pgadmin_data:/var/lib/pgadmin \
            dpage/pgadmin4:latest
    fi
fi

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Install Python dependencies if virtual environment doesn't exist
cd /home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
else
    echo "Virtual environment already exists, activating..."
    source venv/bin/activate
fi

# Run database migrations
echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser if it doesn't exist (optional)
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.com', 'admin123') if not User.objects.filter(username='admin').exists() else None" | python manage.py shell

# Initialize content roles
echo "Initializing content roles..."
python manage.py create_content_roles

# Start backend
echo "Starting backend..."
python manage.py runserver 0.0.0.0:8000 > /tmp/backend.log 2>&1 &

# Install frontend dependencies and start frontend
cd /home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/frontend
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

REACT_APP_API_URL=http://localhost:8000 npm start > /tmp/frontend.log 2>&1 &

echo "All services started!"
echo ""
echo "Services:"
echo "- PostgreSQL: localhost:5439"
echo "- pgAdmin: http://localhost:5050"
echo "- Backend API: http://localhost:8000"
echo "- Frontend: http://localhost:3000"
echo ""
echo "Check logs in /tmp/backend.log and /tmp/frontend.log if needed."