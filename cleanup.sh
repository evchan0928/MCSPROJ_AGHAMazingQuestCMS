#!/bin/bash

# Cleanup script for AGHAMazingQuestCMS
# Removes bloat files and keeps only essential files for the application

echo "Starting cleanup of AGHAMazingQuestCMS..."

# Remove Python cache files
find . -type f -name "*.pyc" -delete
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type d -name "*.pyc" -exec rm -rf {} +

# Remove any temporary files
find . -type f -name "*.tmp" -delete
find . -type f -name "*~" -delete
find . -type f -name ".DS_Store" -delete
find . -type f -name "Thumbs.db" -delete

# Remove frontend build artifacts if they exist in the repo (they should be in containers only)
rm -rf frontend/build/ 2>/dev/null || true
rm -rf frontend/dist/ 2>/dev/null || true

# Clean up any log files
find . -type f -name "*.log" -delete

echo "Cleanup completed!"
echo ""
echo "Essential files and directories preserved:"
echo "- backend/: Django backend application"
echo "- frontend/: React frontend application"
echo "- devops/: Docker configuration and deployment files"
echo "- docs/: Documentation"
echo "- .env: Environment configuration"
echo "- start_full_stack.sh: Application startup script"
echo "- stop_full_stack.sh: Application shutdown script"
echo "- SETUP_GUIDE.md: This setup guide"
echo ""
echo "The application is ready for committing to version control."