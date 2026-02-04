#!/bin/bash
# Script to start the frontend server accessible from local network

echo "Starting frontend server accessible from local network..."

# Navigate to frontend directory
cd /home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/frontend

# Check if node_modules exists, install dependencies if not
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run the React development server
echo "Starting React development server..."
npm start