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
            -v postgres_data:/var/lib/postgresql/data \
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
            -v pgadmin_data:/var/lib/pgadmin \
            dpage/pgadmin4:latest
    fi
fi

# Start backend
echo "Starting backend..."
cd /home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000 > /tmp/backend.log 2>&1 &

# Start frontend
echo "Starting frontend..."
cd /home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS/frontend
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