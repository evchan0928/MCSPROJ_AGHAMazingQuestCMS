#!/bin/bash
# AGHAMazingQuestCMS Development Environment Stop Script
# This script stops the complete full-stack development environment

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Stopping AGHAMazingQuestCMS Development Environment ===${NC}"

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

# Stop the full stack
print_status "Stopping the full stack..."
docker compose -f docker-compose-fullstack.yml down

print_status "Development environment stopped successfully."
print_status ""
print_status "To start the development environment again, run: ./setup_development.sh"
print_status ""