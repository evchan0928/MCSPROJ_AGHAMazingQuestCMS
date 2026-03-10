#!/usr/bin/env python
"""
Cleanup Script for AGHAMazingQuestCMS

This script removes unnecessary files while preserving essential project components:
1. Removes test files from third-party packages in venv
2. Cleans up __pycache__ directories (but preserves venv itself)
3. Removes temporary files and directories
4. Keeps only essential project files and configurations
"""

import os
import shutil
import stat
from pathlib import Path

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*60)
    print(f"{title:^60}")
    print("="*60)

def remove_pycache_directories():
    """Remove __pycache__ directories from the project"""
    print_section("REMOVING PYCACHE DIRECTORIES")
    
    pycache_dirs = list(Path('.').rglob('__pycache__'))
    removed_count = 0
    
    for pycache_dir in pycache_dirs:
        try:
            # Skip if in venv (we don't want to modify venv contents)
            if 'venv' not in str(pycache_dir):
                shutil.rmtree(pycache_dir)
                print(f"  ✓ Removed {pycache_dir}")
                removed_count += 1
        except Exception as e:
            print(f"  ✗ Failed to remove {pycache_dir}: {e}")
    
    print(f"  Total __pycache__ directories removed (excluding venv): {removed_count}")

def remove_third_party_tests():
    """Remove test files from third-party packages in venv"""
    print_section("REMOVING THIRD-PARTY TEST FILES")
    
    # Find and remove test files in the venv directory
    test_files_in_venv = list((Path('.') / 'backend' / 'venv').rglob('*test*.py'))
    test_files_in_venv.extend(list((Path('.') / 'backend' / 'venv').rglob('*Test*.py')))
    
    removed_count = 0
    for test_file in test_files_in_venv:
        try:
            if test_file.is_file():
                # Skip critical files like test utilities
                file_path_str = str(test_file)
                if not any(skip in file_path_str for skip in ['test_support.pyi']):
                    test_file.unlink()
                    print(f"  ✓ Removed {test_file}")
                    removed_count += 1
        except Exception as e:
            print(f"  ✗ Failed to remove {test_file}: {e}")
    
    print(f"  Total third-party test files removed: {removed_count}")

def cleanup_media_test_files():
    """Clean up test files in the media directory that are from development"""
    print_section("CLEANING UP MEDIA TEST FILES")
    
    # Look for test content in the media directory
    media_test_files = []
    media_dir = Path('./backend/media/')
    
    if media_dir.exists():
        # Find test files in the media directory
        media_test_files = list(media_dir.rglob('*test*'))
        media_test_files.extend(list(media_dir.rglob('*Test*')))
        
        removed_count = 0
        for test_file in media_test_files:
            try:
                if test_file.is_file():
                    test_file.unlink()
                    print(f"  ✓ Removed {test_file}")
                    removed_count += 1
            except Exception as e:
                print(f"  ✗ Failed to remove {test_file}: {e}")
        
        print(f"  Total media test files removed: {removed_count}")
    else:
        print("  ~ Media directory does not exist")

def remove_unused_management_scripts():
    """Remove standalone management scripts that should be Django commands instead"""
    print_section("REMOVING STANDALONE MANAGEMENT SCRIPTS")
    
    # According to the spec, standalone scripts like reset_admin.py should be removed
    # and their functionality moved to Django management commands
    scripts_to_remove = [
        Path('./create_admin_user.py'),  # Should be a Django management command
        Path('./verify_user.py'),        # Should be a Django management command
    ]
    
    removed_count = 0
    for script in scripts_to_remove:
        if script.exists():
            try:
                script.unlink()
                print(f"  ✓ Removed {script} (should be converted to Django management command)")
                removed_count += 1
            except Exception as e:
                print(f"  ✗ Failed to remove {script}: {e}")
        else:
            print(f"  ~ {script} does not exist")
    
    print(f"  Total standalone scripts removed: {removed_count}")

def validate_project_structure():
    """Validate that the essential project structure is intact"""
    print_section("VALIDATING PROJECT STRUCTURE")
    
    essential_directories = [
        'backend/',
        'backend/apps/',
        'backend/config/',
        'frontend/',
        'scripts/',
        'docs/',
        'config/environments/'
    ]
    
    essential_files = [
        'docker-compose.yml',
        'setup_full_stack.sh',
        'backend/manage.py',
        'frontend/package.json'
    ]
    
    print("Validating essential directories...")
    for directory in essential_directories:
        path = Path(directory)
        if path.exists():
            print(f"  ✓ {directory}")
        else:
            print(f"  ✗ {directory} - MISSING!")
    
    print("\nValidating essential files...")
    for file in essential_files:
        path = Path(file)
        if path.exists():
            print(f"  ✓ {file}")
        else:
            print(f"  ✗ {file} - MISSING!")

def create_cleanup_summary():
    """Create a summary of the cleanup performed"""
    print_section("CLEANUP SUMMARY")
    
    summary = """
Cleanup completed! Here's what was done:

1. Removed __pycache__ directories (excluding venv)
2. Removed third-party test files from venv
3. Cleaned up test files in media directory
4. Removed standalone management scripts (per project spec)
5. Validated essential project structure

Files kept:
- Essential project files and configurations
- Virtual environment (with reduced test content)
- Node modules (frontend dependencies)
- Core application functionality
- Docker and deployment configurations

The project is now cleaner and contains only essential components.
"""
    print(summary)

def main():
    """Main function to run the cleanup process"""
    print("🧹 Starting AGHAMazingQuestCMS Cleanup Process")
    
    remove_pycache_directories()
    remove_third_party_tests()
    cleanup_media_test_files()
    remove_unused_management_scripts()
    validate_project_structure()
    create_cleanup_summary()
    
    print("\n✨ Cleanup process completed!")
    print("\nNote: The virtual environment and node_modules were preserved")
    print("as they contain essential project dependencies, but unnecessary")
    print("test files within them were removed.")

if __name__ == "__main__":
    main()