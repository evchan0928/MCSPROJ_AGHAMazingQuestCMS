#!/bin/bash
# Script to start the frontend server allowing network access

echo "🌐 Starting AGHAMazingQuestCMS Frontend Server (Network Access)"
echo "================================================================"
echo "Frontend will be accessible at: http://172.19.91.23:3000"
echo "Press Ctrl+C to stop the server"
echo ""

# Navigate to frontend directory
cd /home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS/frontend

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
fi

# Start the React development server with network access
echo "🚀 Starting React development server..."
echo "   This may take a moment..."
echo ""

# Set HOST to 0.0.0.0 to allow external connections
HOST=0.0.0.0 npm start