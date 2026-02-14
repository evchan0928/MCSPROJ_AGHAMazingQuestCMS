#!/bin/bash
# AGHAMazingQuestCMS Optimized Development Environment Stop Script
# This script stops the optimized development environment safely

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== AGHAMazingQuestCMS Optimized Development Environment Shutdown ===${NC}"

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

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
print_status "Project root: $PROJECT_ROOT"

# Navigate to devops directory
cd "$PROJECT_ROOT/devops"

print_status "Stopping full stack services..."
docker compose -f docker-compose-fullstack.yml down --remove-orphans

print_status "Services stopped successfully."

print_status "Verifying services are stopped..."
if [ "$(docker ps -q -f name=agha-)" ]; then
    print_warning "Some containers may still be running:"
    docker ps -f name=agha-
else
    print_status "All AGHA containers have been stopped."
fi

print_status "Optimized development environment stopped successfully!"
print_status "To restart, run: ./setup_optimized.sh"
print_warning "Note: Application will be available at http://localhost:8081 (instead of 8080) due to port conflict"