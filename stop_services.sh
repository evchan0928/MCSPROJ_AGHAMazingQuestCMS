#!/bin/bash
# AGHAMazingQuestCMS Service Stop Script
# This script stops all running backend and frontend development servers

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Print header
echo "================================"
echo "AGHAMazingQuestCMS Service Stop"
echo "================================"

# Kill all child processes
print_status "Stopping backend and frontend processes..."

# Kill any running Python processes (backend)
PYTHON_PROCESSES=$(pgrep -f "manage.py runserver")
if [ -n "$PYTHON_PROCESSES" ]; then
    kill $PYTHON_PROCESSES 2>/dev/null || true
    print_success "Stopped backend processes"
else
    print_status "No backend processes found"
fi

# Kill any running Node processes (frontend)
NODE_PROCESSES=$(pgrep -f "npm start\|node")
if [ -n "$NODE_PROCESSES" ]; then
    kill $NODE_PROCESSES 2>/dev/null || true
    print_success "Stopped frontend processes"
else
    print_status "No frontend processes found"
fi

# Kill any remaining processes that might be running on ports 8000 or 3000
if command -v lsof &> /dev/null; then
    LSOFLIST_8000=$(lsof -ti:8000)
    if [ -n "$LSOFLIST_8000" ]; then
        kill $LSOFLIST_8000 2>/dev/null || true
        print_success "Stopped processes on port 8000"
    fi
    
    LSOFLIST_3000=$(lsof -ti:3000)
    if [ -n "$LSOFLIST_3000" ]; then
        kill $LSOFLIST_3000 2>/dev/null || true
        print_success "Stopped processes on port 3000"
    fi
fi

# Clear any remaining node processes
if command -v pkill &> /dev/null; then
    pkill -f "webpack" 2>/dev/null || true
    pkill -f "react-scripts" 2>/dev/null || true
    pkill -f "webpack-dev-server" 2>/dev/null || true
fi

print_success "All services have been stopped"
echo ""
print_status "To restart the application, run: ./setup_full_stack.sh"