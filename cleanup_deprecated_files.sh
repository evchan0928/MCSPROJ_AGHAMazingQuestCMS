#!/bin/bash
# AGHAMazingQuestCMS Cleanup Script
# This script removes deprecated files and optimizes the project structure
# Following the project specification for file structure governance

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== AGHAMazingQuestCMS Project Structure Optimization ===${NC}"
echo -e "${CYAN}=== Removing Deprecated Files and Optimizing Structure ===${NC}"

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

print_removal() {
    echo -e "${RED}[REMOVED]${NC} $1"
}

print_retained() {
    echo -e "${GREEN}[RETAINED]${NC} $1"
}

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
print_status "Project root: $PROJECT_ROOT"

cd "$PROJECT_ROOT"

# List of deprecated files to remove according to project specification
print_status "Identifying deprecated files for removal..."

# Check and remove deprecated documentation
DEPRECATED_DOCS=(
    "SETUP_GUIDE.md"
    "SYSTEM_ACCESS_GUIDE.md"
    "COMPREHENSIVE_FIXES.md"
    "ORGANIZATION.md"
)

for doc in "${DEPRECATED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        print_removal "Deprecated documentation: $doc"
        rm "$doc"
    else
        print_status "File does not exist (already removed?): $doc"
    fi
done

# Check and remove deprecated scripts
DEPRECATED_SCRIPTS=(
    "start_full_stack.sh"
    "stop_full_stack.sh"
    "remove_deprecated_guides.sh"
)

for script in "${DEPRECATED_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        print_removal "Deprecated script: $script"
        rm "$script"
    else
        print_status "Script does not exist (already removed?): $script"
    fi
done

# Clean Python cache files
print_status "Cleaning Python cache files..."
find . -type f -name "*.pyc" -delete
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type d -name "*.pyc" -exec rm -rf {} +
print_status "Python cache files removed"

# Clean temporary files
print_status "Cleaning temporary files..."
find . -type f -name "*.tmp" -delete
find . -type f -name "*~" -delete
find . -type f -name ".DS_RETAINED" -delete
find . -type f -name "Thumbs.db" -delete
find . -type f -name "*.log" -delete
print_status "Temporary files removed"

# Remove frontend build artifacts if they exist
if [ -d "frontend/build" ]; then
    print_removal "Frontend build artifacts: frontend/build/"
    rm -rf frontend/build/
fi

if [ -d "frontend/dist" ]; then
    print_removal "Frontend distribution: frontend/dist/"
    rm -rf frontend/dist/
fi

# Identify remaining files and categorize them
print_status ""
print_status "Project structure after cleanup:"
print_status "=================================="
echo ""
echo "Core functionality files retained:"
echo ""
echo "  Backend:"
echo "  - backend/ (Django application)"
echo "  - backend/manage.py"
echo "  - backend/apps/*/models.py, views.py, urls.py"
echo ""
echo "  Frontend:"
echo "  - frontend/ (React application)"
echo "  - frontend/package.json"
echo "  - frontend/src/App.jsx, src/index.js"
echo ""
echo "  DevOps & Deployment:"
echo "  - devops/docker-compose-fullstack.yml"
echo "  - devops/nginx-config/agha-proxy.conf"
echo "  - docker/ (Docker configurations)"
echo ""
echo "  Essential Scripts:"
echo "  - setup_optimized.sh (NEW - optimized setup)"
echo "  - stop_optimized.sh (NEW - optimized stop)"
echo "  - cleanup_deprecated_files.sh (THIS SCRIPT)"
echo "  - setup_development.sh (retained for comparison)"
echo "  - stop_development.sh (retained for comparison)"
echo "  - cleanup.sh (retained for cache cleaning)"
echo "  - cleanup_docker.sh (retained for Docker cleanup)"
echo ""
echo "  Documentation:"
echo "  - FULL_STACK_DEVELOPMENT_SETUP.md (NEW - comprehensive guide)"
echo "  - DEVELOPMENT_SETUP_GUIDE.md (retained as secondary reference)"
echo "  - README.md (retained)"
echo "  - .env, .env.example (retained)"
echo ""
echo "  Infrastructure:"
echo "  - .git/, .gitignore (retained)"
echo "  - venv/ (retained if present)"
echo ""

print_status ""
print_status "✅ Cleanup and optimization completed successfully!"
print_status ""
print_status "The project structure is now optimized following the governance specification:"
print_status "• Removed deprecated documentation that could confuse developers"
print_status "• Kept only essential files for functionality"
print_status "• Maintained clear separation: devops/, backend/, frontend/, docs/"
print_status "• Preserved the new optimized setup scripts and documentation"
print_status ""
print_status "To set up the optimized environment, run: ./setup_optimized.sh"