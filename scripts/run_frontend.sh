#!/bin/bash
# Script to run the frontend React development server

echo "🚀 Starting AGHAMazingQuestCMS Frontend Server..."
echo "Frontend will be available at http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/frontend

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
fi

echo "🌟 Starting React development server..."
npm start