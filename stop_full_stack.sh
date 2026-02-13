#!/bin/bash

# AGHAMazingQuestCMS Full Stack Shutdown Script
# This script stops all services for the full stack application

echo "Shutting down AGHAMazingQuestCMS Full Stack Application..."
echo "=========================================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Stopping nginx reverse proxy..."
cd "$SCRIPT_DIR/devops" && docker compose -f docker-compose-nginx-only.yml down

echo "Stopping backend services..."
cd "$SCRIPT_DIR/devops" && docker compose -f docker-compose-fullstack.yml down

echo ""
echo "Full Stack Application Stopped Successfully!"
echo "=============================================="
echo ""
echo "NOTICE:"
echo "------"
echo "If you had to stop a system nginx service to run this application,"
echo "you may want to restart it with: sudo systemctl start nginx"
echo ""
echo "All services have been stopped."
echo ""
echo "To start the application again, run: ./start_full_stack.sh"
echo ""