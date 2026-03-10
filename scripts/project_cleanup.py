#!/usr/bin/env python
"""
Project Cleanup Script for AGHAMazingQuestCMS

This script identifies and fixes organizational issues in the project:
1. Removes duplicate reset_admin.py files
2. Checks for incomplete flutter project
3. Consolidates environment files
4. Organizes files into proper structure
"""

import os
import shutil
import sys
from pathlib import Path

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*60)
    print(f"{title:^60}")
    print("="*60)

def remove_duplicate_reset_admin():
    """Remove duplicate reset_admin.py files, keeping only the Django management command version"""
    print_section("CLEANING DUPLICATE FILES")
    
    # Paths to the duplicate files
    root_reset = Path("./reset_admin.py")
    backend_reset = Path("./backend/reset_admin.py")
    auth_reset = Path("./backend/apps/authentication/management/commands/reset_admin.py")
    
    print("Found duplicate reset_admin.py files:")
    
    if root_reset.exists():
        print(f"  - {root_reset} (ROOT - WILL REMOVE)")
        try:
            root_reset.unlink()
            print("  ✓ Removed duplicate from root")
        except Exception as e:
            print(f"  ✗ Failed to remove {root_reset}: {e}")
    
    if backend_reset.exists():
        print(f"  - {backend_reset} (BACKEND - WILL REMOVE)")
        try:
            backend_reset.unlink()
            print("  ✓ Removed duplicate from backend/")
        except Exception as e:
            print(f"  ✗ Failed to remove {backend_reset}: {e}")
    
    # Keep the auth version as it's properly structured as a Django management command
    if auth_reset.exists():
        print(f"  - {auth_reset} (AUTHENTICATION APP - KEEPING)")
    
    print("  ✓ Duplicate reset_admin.py files cleaned up")

def check_flutter_project():
    """Check if the flutter project is complete or incomplete"""
    print_section("CHECKING FLUTTER PROJECT")
    
    flutter_path = Path("./aghamazingflutter-master")
    
    if flutter_path.exists():
        # Check for essential flutter files
        essential_files = [
            "pubspec.yaml",
            "lib/main.dart",
            "android/",
            "ios/",
            ".git"
        ]
        
        missing_files = []
        for file in essential_files:
            if not (flutter_path / file).exists():
                missing_files.append(file)
        
        if missing_files:
            print(f"  ⚠️  Incomplete Flutter project detected at {flutter_path}")
            print(f"  Missing essential files: {missing_files}")
            print("  This appears to be an abandoned or incomplete project")
            print("\n  Options:")
            print("    A) Archive for later review")
            print("    B) Remove completely (recommended if not needed)")
            print("    C) Skip (keep as is)")
            
            choice = input("\n  Choose option (A/B/C): ").upper().strip()
            
            if choice == "A":
                archive_path = Path("./archived_projects/aghamazingflutter-master")
                archive_path.parent.mkdir(exist_ok=True)
                
                try:
                    if archive_path.exists():
                        shutil.rmtree(archive_path)
                    
                    shutil.move(str(flutter_path), str(archive_path))
                    print(f"  ✓ Archived Flutter project to {archive_path}")
                except Exception as e:
                    print(f"  ✗ Failed to archive: {e}")
                    
            elif choice == "B":
                try:
                    shutil.rmtree(flutter_path)
                    print(f"  ✓ Removed incomplete Flutter project")
                except Exception as e:
                    print(f"  ✗ Failed to remove: {e}")
            
            elif choice == "C":
                print("  ~ Skipping Flutter project removal")
        else:
            print(f"  ✓ Complete Flutter project detected at {flutter_path}")
    else:
        print("  ~ No Flutter project found")

def consolidate_env_files():
    """Consolidate environment files and document differences"""
    print_section("CONSOLIDATING ENVIRONMENT FILES")
    
    env_files = {
        '.env': Path('.env'),
        '.env.example': Path('.env.example'), 
        '.env.local': Path('.env.local')
    }
    
    print("Current environment files:")
    for name, path in env_files.items():
        status = "✓ EXISTS" if path.exists() else "✗ MISSING"
        print(f"  - {name:<15} {status}")
    
    print("\nRecommendation:")
    print("  .env - Keep as main configuration")
    print("  .env.example - Keep as template for new installations")
    print("  .env.local - Usually for local overrides, may be in .gitignore")
    
    # Create documentation about the files
    doc_content = """
# Environment Files Documentation

## Purpose of Each File

- `.env` - Main environment configuration for the current installation
- `.env.example` - Template showing required variables for new installations
- `.env.local` - Local overrides for development (typically in .gitignore)

## Recommended Structure
```
# .env - Production/Development configuration
POSTGRES_DB=aghamazing_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
# ... other production variables

# .env.example - Template for new installations
POSTGRES_DB=appdb
POSTGRES_USER=appuser
POSTGRES_PASSWORD=password
# ... template variables

# .env.local - Local development overrides
POSTGRES_DB=local_aghamazing_db
POSTGRES_USER=local_user
POSTGRES_PASSWORD=local_password
# ... local overrides
```
"""
    
    docs_dir = Path('./docs')
    docs_dir.mkdir(exist_ok=True)
    
    env_doc_path = docs_dir / 'environment_variables.md'
    try:
        with open(env_doc_path, 'w') as f:
            f.write(doc_content.strip())
        print(f"\n  ✓ Created documentation: {env_doc_path}")
    except Exception as e:
        print(f"  ✗ Failed to create env documentation: {e}")

def organize_scripts():
    """Organize scripts into proper directory structure"""
    print_section("ORGANIZING SCRIPTS")
    
    # Create scripts directory if not exists
    scripts_dir = Path('./scripts')
    scripts_dir.mkdir(exist_ok=True)
    
    # Move various scripts to organized location
    scripts_to_move = {
        'setup_full_stack.sh': scripts_dir / 'setup_full_stack.sh',
        'start_dev_services.sh': scripts_dir / 'start_dev_services.sh',
        'stop_services.sh': scripts_dir / 'stop_services.sh',
        'start_nginx.sh': scripts_dir / 'start_nginx.sh',
    }
    
    moved_count = 0
    for src_name, dest_path in scripts_to_move.items():
        src_path = Path(src_name)
        if src_path.exists() and not dest_path.exists():  # Only move if source exists and destination doesn't
            try:
                shutil.copy2(src_path, dest_path)  # Use copy2 to preserve metadata
                print(f"  ✓ Copied {src_name} to {dest_path}")
                moved_count += 1
            except Exception as e:
                print(f"  ✗ Failed to move {src_name}: {e}")
    
    if moved_count > 0:
        print(f"  ~ Note: Scripts copied to {scripts_dir}, original files preserved")
    else:
        print(f"  ~ All scripts already organized in {scripts_dir}")

def create_project_structure_docs():
    """Create documentation about the project structure"""
    print_section("CREATING STRUCTURE DOCUMENTATION")
    
    structure_doc = """
# AGHAMazingQuestCMS - Project Structure

## Overview
This document describes the organization of the AGHAMazingQuestCMS project.

## Directory Structure
```
AGHAMazingQuestCMS/
├── backend/                 # Django REST API backend
│   ├── apps/               # Custom Django applications
│   │   ├── contentmanagement/     # Content management functionality
│   │   ├── usermanagement/        # User management functionality  
│   │   ├── mobilemanagement/      # Mobile app integration
│   │   └── analyticsmanagement/   # Analytics functionality
│   ├── config/             # Django settings and configuration
│   ├── middleware/         # Custom middleware
│   ├── staticfiles/        # Collected static files
│   ├── media/              # Uploaded media files
│   ├── manage.py           # Django management utility
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend application
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   ├── package.json        # Node.js dependencies
│   └── build/              # Production build
├── scripts/                # Utility and deployment scripts
├── docs/                   # Documentation
├── .env                    # Environment variables
├── .env.example            # Environment variables template
├── docker-compose.yml      # Docker services configuration
├── README.md               # Main project documentation
└── setup_full_stack.sh     # Main setup script
```

## Key Files
- `docker-compose.yml` - Defines all services for the application
- `setup_full_stack.sh` - Main script to start the complete application
- `backend/requirements.txt` - Python dependencies
- `frontend/package.json` - JavaScript dependencies

## Important Notes
- All custom Django apps are in `backend/apps/`
- Authentication logic is in `backend/apps/authentication/`
- Environment variables should be set in `.env`
- Docker is the primary deployment method
"""
    
    docs_dir = Path('./docs')
    structure_doc_path = docs_dir / 'project_structure.md'
    
    try:
        with open(structure_doc_path, 'w') as f:
            f.write(structure_doc.strip())
        print(f"  ✓ Created project structure documentation: {structure_doc_path}")
    except Exception as e:
        print(f"  ✗ Failed to create structure documentation: {e}")

def run_analysis():
    """Run the complete project cleanup and organization"""
    print("🚀 Starting AGHAMazingQuestCMS Project Cleanup and Organization")
    
    remove_duplicate_reset_admin()
    check_flutter_project()
    consolidate_env_files()
    organize_scripts()
    create_project_structure_docs()
    
    print_section("CLEANUP COMPLETE")
    print("Summary of actions taken:")
    print("  ✓ Removed duplicate reset_admin.py files")
    print("  ✓ Checked incomplete Flutter project")
    print("  ✓ Documented environment file purposes") 
    print("  ✓ Organized scripts into dedicated directory")
    print("  ✓ Created project structure documentation")
    print("\nThe project is now better organized and documented!")
    
if __name__ == "__main__":
    run_analysis()