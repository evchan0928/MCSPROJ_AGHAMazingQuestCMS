#!/bin/bash

# Stop Services Script for AGHAMazingQuestCMS
# Stops all running backend and frontend services

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================${NC}"
echo -e "${BLUE}Stopping AGHAMazingQuestCMS${NC}"
echo -e "${BLUE}=========================${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if services.conf exists
if [ ! -f services.conf ]; then
    print_warning "services.conf not found. Services may not have been started with setup_full_stack.sh"
    exit 1
fi

# Load service PIDs
source services.conf

# Kill backend process if it exists
if [ ! -z "$BACKEND_PID" ]; then
    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_status "Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        sleep 2
        
        # Verify it's stopped
        if kill -0 $BACKEND_PID 2>/dev/null; then
            print_warning "Backend server did not stop gracefully, forcing termination..."
            kill -9 $BACKEND_PID 2>/dev/null
        fi
        print_status "Backend server stopped"
    else
        print_warning "Backend process (PID: $BACKEND_PID) not found or already stopped"
    fi
else
    print_warning "Backend PID not found in services.conf"
fi

# Kill frontend process if it exists
if [ ! -z "$FRONTEND_PID" ]; then
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        print_status "Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        sleep 2
        
        # Verify it's stopped
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            print_warning "Frontend server did not stop gracefully, forcing termination..."
            kill -9 $FRONTEND_PID 2>/dev/null
        fi
        print_status "Frontend server stopped"
    else
        print_warning "Frontend process (PID: $FRONTEND_PID) not found or already stopped"
    fi
else
    print_warning "Frontend PID not found in services.conf"
fi

# Clean up PID files
rm -f backend_pid.txt frontend_pid.txt services.conf

print_status "All services stopped successfully"
echo ""
print_status "AGHAMazingQuestCMS has been shut down"