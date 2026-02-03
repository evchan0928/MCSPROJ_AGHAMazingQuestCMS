#!/bin/bash
# Staging Environment Startup Script for AGHAMazingQuestCMS
# This script starts the Django backend and ensures the system is ready for staging access

echo "🚀 Starting AGHAMazingQuestCMS - Staging Environment"
echo "===================================================="

# Activate virtual environment
cd /home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS
source venv/bin/activate

echo "🔌 Starting Django Backend Server (Staging Mode)..."
echo "   Backend will be accessible at: http://172.19.91.23:8080"
echo "   Backend will be accessible from network at: http://0.0.0.0:8080"
echo ""
echo "💡 Frontend should connect to: http://172.19.91.23:8080/api"
echo ""

# Start Django development server bound to all interfaces
# This allows access from other machines on the network
python manage.py runserver 0.0.0.0:8080