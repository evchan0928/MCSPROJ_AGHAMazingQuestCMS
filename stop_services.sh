#!/bin/bash

# Stop Services Script
# This script stops the running backend and frontend processes

echo "==========================================="
echo "Stopping AHA Amazing Quest CMS Services"
echo "==========================================="

# Kill processes running on port 8000 and 3000
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null; then
    echo "Stopping backend server on port 8000..."
    lsof -ti:8000 | xargs kill -TERM
    echo "Backend stopped."
else
    echo "No process found on port 8000"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
    echo "Stopping frontend server on port 3000..."
    lsof -ti:3000 | xargs kill -TERM
    echo "Frontend stopped."
else
    echo "No process found on port 3000"
fi

# Also kill any lingering node or python processes related to our app
echo "Stopping any lingering processes..."
pids=$(pgrep -f "manage.py runserver\|npm start" || true)
if [ ! -z "$pids" ]; then
    kill -TERM $pids
    echo "Lingering processes stopped."
else
    echo "No lingering processes found."
fi

echo "All services stopped."