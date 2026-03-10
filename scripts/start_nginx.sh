#!/bin/bash

# Script to start Nginx with custom configuration for the AGHAMazingQuestCMS

echo "Starting Nginx with custom configuration..."

# Stop any existing Nginx processes
sudo pkill -f nginx 2>/dev/null

# Start Nginx with our custom configuration
sudo nginx -c /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/nginx.conf

echo "Nginx started with configuration for AGHAMazingQuestCMS"
echo "Access the application at http://localhost:8080"