#!/bin/bash

# Comprehensive Docker cleanup script for AGHAMazingQuestCMS
# Removes obsolete containers, images, volumes, and configurations

echo "Starting comprehensive Docker cleanup for AGHAMazingQuestCMS..."
echo "=============================================================="

# Stop all containers related to the project
echo "1. Stopping all containers..."
docker compose -f devops/docker-compose-fullstack.yml down 2>/dev/null || echo "Fullstack compose not running"
docker compose -f devops/docker-compose-nginx-only.yml down 2>/dev/null || echo "Nginx compose not running"
docker compose -f devops/docker-compose-with-nginx.yml down 2>/dev/null || echo "With-nginx compose not running"

# Remove all containers that might be left over
docker stop $(docker ps -aq --filter "name=agha-*") 2>/dev/null || echo "No containers to stop"
docker rm $(docker ps -aq --filter "name=agha-*") 2>/dev/null || echo "No containers to remove"

echo ""
echo "2. Cleaning up Docker images..."
# Remove devops images
docker rmi -f devops-backend:latest 2>/dev/null || echo "devops-backend image not found"
docker rmi -f devops-frontend:latest 2>/dev/null || echo "devops-frontend image not found"
docker rmi -f devops_backend:latest 2>/dev/null || echo "devops_backend image not found"

echo ""
echo "3. Cleaning up Docker volumes..."
# Remove project volumes that might be obsolete
docker volume prune -f
docker volume ls -q --filter "name=agha-" | xargs -r docker volume rm
docker volume ls -q --filter "name=devops-" | xargs -r docker volume rm

echo ""
echo "4. Cleaning up Docker networks..."
# Remove project networks
docker network prune -f
docker network ls -q --filter "name=devops_" | xargs -r docker network rm

echo ""
echo "5. Organizing project files..."
# Remove obsolete docker-compose files
rm -f /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/devops/docker-compose-with-nginx.yml

# Clean up any temporary files
find /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS -type f -name "*.tmp" -delete
find /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS -name "*.pyc" -delete

echo ""
echo "Docker cleanup completed!"
echo ""
echo "Next steps:"
echo "- Rebuild the application with: ./start_full_stack.sh"
echo "- The system is now clean and ready for a fresh start"
echo ""
echo "Current Docker system status:"
echo "Containers: $(docker ps -q | wc -l)"
echo "Images: $(docker images -q | wc -l)"
echo "Volumes: $(docker volume ls -q | wc -l)"
echo ""