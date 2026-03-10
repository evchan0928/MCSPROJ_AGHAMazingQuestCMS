#!/usr/bin/env python
"""
Reorganize Project Structure Script for AGHAMazingQuestCMS

This script reorganizes the project structure to be more maintainable:
1. Creates proper documentation directories
2. Moves configuration files to appropriate locations
3. Improves the overall project organization
"""

import os
import shutil
from pathlib import Path

def create_directory_structure():
    """Create a better organized directory structure"""
    print("Creating improved directory structure...")
    
    # Create new directory structure
    directories = [
        'docs/architecture',
        'docs/api',
        'docs/deployment',
        'docs/testing',
        'scripts/deployment',
        'scripts/database',
        'scripts/development',
        'backend/tests',
        'frontend/tests',
        'config/environments',
        'logs'
    ]
    
    for directory in directories:
        dir_path = Path(directory)
        dir_path.mkdir(parents=True, exist_ok=True)
        print(f"  ✓ Created directory: {directory}")

def move_config_files():
    """Move configuration files to appropriate locations"""
    print("\nMoving configuration files...")
    
    # Move environment files to config/environments
    env_files = ['.env', '.env.example', '.env.local']
    
    for env_file in env_files:
        src_path = Path(env_file)
        dst_path = Path(f'config/environments/{env_file}')
        
        if src_path.exists():
            try:
                if not dst_path.exists():
                    shutil.move(str(src_path), str(dst_path))
                    print(f"  ✓ Moved {env_file} to config/environments/")
                else:
                    print(f"  ~ {env_file} already exists in destination")
            except Exception as e:
                print(f"  ✗ Failed to move {env_file}: {e}")
    
    # Create symbolic links in root to maintain compatibility
    for env_file in env_files:
        src_path = Path(f'config/environments/{env_file}')
        link_path = Path(env_file)
        
        if src_path.exists() and not link_path.exists():
            try:
                os.symlink(src_path, link_path)
                print(f"  ✓ Created symlink for {env_file}")
            except OSError:
                # On Windows, symlinks require admin privileges
                print(f"  ~ Could not create symlink for {env_file} (requires admin on Windows)")

def create_documentation():
    """Create important documentation files"""
    print("\nCreating documentation...")
    
    # Architecture documentation
    architecture_doc = """# AGHAMazingQuestCMS Architecture

## Overview
The AGHAMazingQuestCMS is a full-stack content management system built with Django (backend) and React (frontend).

## Components

### Backend (Django)
- Built with Django and Django REST Framework
- PostgreSQL database
- Custom Django apps:
  - contentmanagement: Handles content creation and management
  - usermanagement: Manages users and roles
  - mobilemanagement: Integrations for mobile applications
  - analyticsmanagement: Analytics tracking and reporting

### Frontend (React)
- Built with React and JSX
- Connects to Django backend via REST APIs
- Responsive design for multiple device sizes

### Infrastructure
- Docker containers for all services
- Nginx as reverse proxy
- PostgreSQL database
- Portainer for container management
- pgAdmin for database management

## Data Flow
1. User interacts with React frontend
2. Frontend makes API calls to Django backend
3. Backend processes requests and accesses database
4. Response sent back to frontend for display
"""
    
    with open('docs/architecture/overview.md', 'w') as f:
        f.write(architecture_doc)
    print("  ✓ Created architecture documentation")
    
    # API documentation
    api_doc = """# AGHAMazingQuestCMS API Documentation

## Authentication
All API endpoints require authentication using JWT tokens.

## Available Endpoints

### Content Management
- GET /api/content/ - List all content items
- POST /api/content/ - Create new content item
- GET /api/content/{id}/ - Retrieve specific content item
- PUT /api/content/{id}/ - Update specific content item
- DELETE /api/content/{id}/ - Delete specific content item

### User Management
- GET /api/users/ - List all users
- POST /api/users/ - Create new user
- GET /api/users/{id}/ - Retrieve specific user
- PUT /api/users/{id}/ - Update specific user
- DELETE /api/users/{id}/ - Delete specific user

### Analytics
- GET /api/analytics/ - Get analytics data
- POST /api/analytics/download/ - Download analytics report

## Mobile Integration
- GET /api/mobile/ar-content/ - Get AR content for mobile
- GET /api/mobile/chatbot/ - Chatbot integration endpoints
"""
    
    with open('docs/api/endpoints.md', 'w') as f:
        f.write(api_doc)
    print("  ✓ Created API documentation")
    
    # Deployment documentation
    deployment_doc = """# Deployment Guide

## Prerequisites
- Docker and Docker Compose
- Git
- At least 4GB RAM available

## Environment Configuration
1. Copy `.env.example` to `.env`
2. Update database credentials and API keys as needed
3. Verify all required environment variables are set

## Building the Application
```bash
# Clone the repository
git clone <repository-url>
cd AGHAMazingQuestCMS

# Build and start the application
docker-compose up --build -d
```

## Initial Setup
After the first build:
1. Run database migrations: `docker-compose exec backend python manage.py migrate`
2. Create a superuser: `docker-compose exec backend python manage.py createsuperuser`
3. Collect static files: `docker-compose exec backend python manage.py collectstatic --noinput`

## Monitoring
- Application logs: `docker-compose logs -f`
- Database: Access via pgAdmin on port 5050
- Container metrics: Access via Portainer on port 9000
"""
    
    with open('docs/deployment/guide.md', 'w') as f:
        f.write(deployment_doc)
    print("  ✓ Created deployment documentation")

def create_improved_scripts():
    """Create improved utility scripts"""
    print("\nCreating improved scripts...")
    
    # Improved setup script
    setup_script = '''#!/bin/bash
# Improved setup script for AGHAMazingQuestCMS

set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting AGHAMazingQuestCMS Setup..."

# Load environment variables
if [ -f config/environments/.env ]; then
    export $(cat config/environments/.env | xargs)
    echo "✅ Loaded environment variables"
else
    echo "⚠️  Environment file not found at config/environments/.env"
    echo "   Using default environment settings"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Stop any existing services
echo "🛑 Stopping existing services..."
docker-compose down || true

# Build and start services
echo "🐳 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 20

# Run database migrations
echo "🔧 Running database migrations..."
docker-compose exec backend python manage.py migrate

# Create a superuser if one doesn't exist
echo "🔑 Ensuring superuser account exists..."
docker-compose exec backend python create_admin_user.py

echo "✅ Superuser account ensured"

echo "🌟 AGHAMazingQuestCMS is now running!"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000/api/"
echo "   Admin Panel: http://localhost:8000/admin/"
echo "   Portainer: http://localhost:9000"
echo "   pgAdmin: http://localhost:5050"
echo ""
'''
    
    with open('scripts/deployment/setup_production.sh', 'w') as f:
        f.write(setup_script)
    
    # Make executable
    os.chmod('scripts/deployment/setup_production.sh', 0o755)
    print("  ✓ Created improved setup script")
    
    # Database maintenance script
    db_script = '''#!/usr/bin/env python
"""
Database maintenance script for AGHAMazingQuestCMS
"""
import os
import sys
import django
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

def cleanup_old_data():
    """Clean up old data based on retention policy"""
    print("🧹 Cleaning up old data...")
    
    # Example: Clean up old sessions
    from django.contrib.sessions.models import Session
    expired_sessions = Session.objects.filter(expire_date__lt=datetime.now())
    count, _ = expired_sessions.delete()
    print(f"  ✓ Removed {count} expired sessions")
    
    # Add more cleanup operations as needed

def run_maintenance():
    """Run general database maintenance"""
    print("🛠️  Running database maintenance...")
    
    # Example: Run custom maintenance operations
    cleanup_old_data()
    
    print("✅ Database maintenance complete")

if __name__ == "__main__":
    run_maintenance()
'''
    
    with open('scripts/database/maintenance.py', 'w') as f:
        f.write(db_script)
    print("  ✓ Created database maintenance script")

def finalize_organization():
    """Final steps to complete the organization"""
    print("\nFinalizing organization...")
    
    # Create a README for the scripts directory
    scripts_readme = """# Scripts Directory

This directory contains various scripts for managing the AGHAMazingQuestCMS application.

## Directory Structure

- `deployment/` - Scripts for deploying the application
- `database/` - Scripts for database management
- `development/` - Scripts for development workflows

## Important Scripts

- `deployment/setup_production.sh` - Deploy the application to production
- `database/maintenance.py` - Run database maintenance operations
- `development/start_dev.sh` - Start development environment
"""
    
    with open('scripts/README.md', 'w') as f:
        f.write(scripts_readme)
    print("  ✓ Created scripts README")
    
    # Create a main project organization document
    org_doc = """# Project Organization

This document explains the structure and organization of the AGHAMazingQuestCMS project.

## Goals of Reorganization

1. Improve maintainability by grouping related files together
2. Enhance clarity with better documentation
3. Separate configuration from code
4. Provide clear pathways for common tasks

## Directory Structure Explanation

- `backend/` - Contains the Django backend application
- `frontend/` - Contains the React frontend application
- `docs/` - Contains documentation organized by topic
- `scripts/` - Contains utility scripts organized by purpose
- `config/` - Contains configuration files organized by environment
- `logs/` - Contains application logs

## Migration Notes

If you had existing configuration files in the root directory, they have been moved to `config/environments/` and replaced with symbolic links to maintain compatibility.

## Moving Forward

When adding new functionality:
1. Place documentation in the appropriate subdirectory of `docs/`
2. Place scripts in the appropriate subdirectory of `scripts/`
3. Place configuration files in the appropriate subdirectory of `config/`
"""
    
    with open('docs/project_organization.md', 'w') as f:
        f.write(org_doc)
    print("  ✓ Created project organization document")

def main():
    """Main function to run the reorganization"""
    print("🚀 Starting AGHAMazingQuestCMS Reorganization")
    
    create_directory_structure()
    move_config_files()
    create_documentation()
    create_improved_scripts()
    finalize_organization()
    
    print("\n🎉 Project reorganization complete!")
    print("\nKey improvements made:")
    print("- Created organized directory structure")
    print("- Moved configuration files to config/environments/")
    print("- Added comprehensive documentation")
    print("- Created specialized scripts for different purposes")
    print("- Maintained backward compatibility with symlinks")
    
    print("\nNext steps:")
    print("1. Review the new documentation in the docs/ directory")
    print("2. Check that all environment variables are correctly set")
    print("3. Test the new setup scripts")
    print("4. Update any external references to moved files")

if __name__ == "__main__":
    main()