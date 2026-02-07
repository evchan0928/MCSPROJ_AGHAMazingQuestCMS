#!/bin/bash

# Script to commit all changes to the main branch

echo "AGHAMazingQuestCMS - Commit All Changes to Main Branch"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Display current status
echo "Current branch:"
git branch --show-current

echo "Current status:"
git status --short

# Stage all changes
echo "Staging all changes..."
git add .

# Show what will be committed
echo "Changes to be committed:"
git status --short

# Ask for confirmation before committing
read -p "Do you want to commit all changes to the main branch? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Switch to main branch
    echo "Switching to main branch..."
    git checkout main
    
    # Pull latest changes to avoid conflicts
    echo "Pulling latest changes from main..."
    git pull origin main
    
    # Create commit with timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    COMMIT_MESSAGE="Update: Full stack improvements and documentation - $TIMESTAMP"
    
    echo "Creating commit: $COMMIT_MESSAGE"
    git commit -m "$COMMIT_MESSAGE"
    
    # Push changes to remote
    echo "Pushing changes to remote main branch..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "Successfully committed and pushed all changes to main!"
        echo "Commit message: $COMMIT_MESSAGE"
    else
        echo "Error: Failed to push changes to remote"
        exit 1
    fi
else
    echo "Commit cancelled."
fi