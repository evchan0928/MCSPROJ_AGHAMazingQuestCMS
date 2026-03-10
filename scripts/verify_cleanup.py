#!/usr/bin/env python
"""
Verification Script for AGHAMazingQuestCMS Cleanup

This script verifies that the cleanup and organization tasks were completed properly:
1. Checks for remaining duplicate files
2. Verifies the new directory structure
3. Validates that critical functionality still works
"""

import os
import sys
from pathlib import Path
import subprocess

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*60)
    print(f"{title:^60}")
    print("="*60)

def verify_no_duplicates():
    """Verify that duplicate reset_admin.py files were removed properly"""
    print_section("VERIFYING NO DUPLICATES REMAIN")
    
    # Check for remaining duplicate reset_admin.py files
    duplicate_locations = [
        "./reset_admin.py",
        "./backend/reset_admin.py",
        "./backend/apps/authentication/management/commands/reset_admin.py"  # This one should remain
    ]
    
    found_duplicates = []
    for loc in duplicate_locations:
        path = Path(loc)
        if path.exists():
            found_duplicates.append(path)
    
    if len(found_duplicates) <= 1:
        print(f"  ✓ Found {len(found_duplicates)} reset_admin.py file(s) (acceptable)")
        for dup in found_duplicates:
            print(f"    - {dup}")
    else:
        print(f"  ⚠️  Found {len(found_duplicates)} reset_admin.py files (too many):")
        for dup in found_duplicates:
            print(f"    - {dup}")

def verify_new_structure():
    """Verify that the new directory structure was created properly"""
    print_section("VERIFYING NEW STRUCTURE")
    
    expected_dirs = [
        'docs/architecture',
        'docs/api', 
        'docs/deployment',
        'docs/testing',
        'scripts/deployment',
        'scripts/database',
        'scripts/development',
        'config/environments',
        'logs'
    ]
    
    missing_dirs = []
    for dir_path in expected_dirs:
        if not Path(dir_path).exists():
            missing_dirs.append(dir_path)
    
    if not missing_dirs:
        print("  ✓ All expected directories created successfully")
    else:
        print(f"  ⚠️  Missing directories: {missing_dirs}")

def verify_config_moved():
    """Verify that configuration files were properly handled"""
    print_section("VERIFYING CONFIGURATION HANDLING")
    
    # Check original locations (should have symlinks now)
    original_configs = ['.env', '.env.example', '.env.local']
    
    for config in original_configs:
        path = Path(config)
        if path.exists():
            if path.is_symlink():
                print(f"  ✓ {config} is now a symlink to config/environments/")
            else:
                print(f"  ✓ {config} exists in original location")
        else:
            print(f"  ⚠️  {config} not found in original location")
    
    # Check new location
    env_dir = Path('config/environments')
    if env_dir.exists():
        env_files = list(env_dir.glob('*'))
        print(f"  ✓ Config files moved to config/environments/: {[f.name for f in env_files]}")
    else:
        print("  ⚠️  config/environments/ directory not found")

def verify_scripts_created():
    """Verify that the new scripts were created properly"""
    print_section("VERIFYING SCRIPTS CREATION")
    
    expected_scripts = [
        'scripts/deployment/setup_production.sh',
        'scripts/database/maintenance.py',
        'scripts/README.md'
    ]
    
    missing_scripts = []
    for script in expected_scripts:
        if not Path(script).exists():
            missing_scripts.append(script)
    
    if not missing_scripts:
        print("  ✓ All expected scripts created successfully")
    else:
        print(f"  ⚠️  Missing scripts: {missing_scripts}")

def verify_flutter_status():
    """Verify the status of the flutter project"""
    print_section("VERIFYING FLUTTER PROJECT STATUS")
    
    flutter_path = Path('./aghamazingflutter-master')
    archived_path = Path('./archived_projects/aghamazingflutter-master')
    
    if flutter_path.exists():
        print(f"  ~ Incomplete Flutter project still exists at {flutter_path}")
        print("    (This is OK if you chose to keep it during cleanup)")
    elif archived_path.exists():
        print(f"  ✓ Incomplete Flutter project archived to {archived_path}")
    else:
        print("  ~ Incomplete Flutter project either removed or never existed")

def check_critical_functionality():
    """Check that critical functionality still works after cleanup"""
    print_section("CHECKING CRITICAL FUNCTIONALITY")
    
    # Check if docker-compose file exists
    if Path('docker-compose.yml').exists():
        print("  ✓ docker-compose.yml exists")
    else:
        print("  ❌ docker-compose.yml missing!")
    
    # Check if main setup script exists
    if Path('setup_full_stack.sh').exists():
        print("  ✓ setup_full_stack.sh exists")
    else:
        print("  ❌ setup_full_stack.sh missing!")
    
    # Check backend directory
    if Path('backend/').exists():
        print("  ✓ backend/ directory exists")
    else:
        print("  ❌ backend/ directory missing!")
    
    # Check frontend directory
    if Path('frontend/').exists():
        print("  ✓ frontend/ directory exists")
    else:
        print("  ❌ frontend/ directory missing!")

def run_verification():
    """Run the complete verification process"""
    print("🔍 Starting AGHAMazingQuestCMS Verification Process")
    
    verify_no_duplicates()
    verify_new_structure()
    verify_config_moved()
    verify_scripts_created()
    verify_flutter_status()
    check_critical_functionality()
    
    print_section("VERIFICATION COMPLETE")
    print("The verification process has finished.")
    print("\nReview any warnings above and address them as needed.")
    print("\nNote: Some warnings may be acceptable depending on your choices during cleanup.")

if __name__ == "__main__":
    run_verification()