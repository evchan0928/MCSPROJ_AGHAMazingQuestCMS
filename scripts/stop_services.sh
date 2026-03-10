#!/bin/bash

# AGHAMazingQuestCMS Service Stop Script
# Safely stops all running services

echo "🛑 Stopping AGHAMazingQuestCMS services..."

# Stop Docker services
if [[ -f "docker-compose.yml" ]]; then
    echo "🐳 Stopping Docker containers..."
    docker compose down
    echo "✅ Docker containers stopped"
else
    echo "⚠️  No docker-compose.yml found"
fi

# Kill any remaining processes that might be running on our ports
echo "🧹 Cleaning up any remaining processes..."
for port in 8000 3000 5432 9000 5050 8080; do
    pids=$(lsof -ti:$port)
    if [[ -n "$pids" ]]; then
        echo "Killing processes on port $port (PID: $pids)"
        kill -TERM $pids 2>/dev/null || kill -KILL $pids 2>/dev/null || true
    fi
done

# Clean up any temporary files
echo "🧹 Cleaning up temporary files..."
rm -f requirements_installed

echo "✅ All services stopped successfully"