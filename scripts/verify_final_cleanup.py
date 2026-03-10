#!/usr/bin/env python
"""
Final Verification Script for Local-Only CMS Setup

This script verifies that:
1. All Neon configurations have been removed
2. Only local configurations remain
3. Duplicate files have been cleaned up
4. The project is ready for local-only operation
"""

import os
import re
from pathlib import Path

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*70)
    print(f"{title:^70}")
    print("="*70)

def verify_no_neon_configs():
    """Verify that Neon configurations have been removed"""
    print_section("VERIFYING NO NEON CONFIGURATIONS REMAIN")
    
    files_to_check = [
        './README.md',
        './config/environments/.env.example',
        './backend/config/settings/base.py',
        './config/environments/.env',
        './config/environments/.env.local'
    ]
    
    neon_indicators = [
        'neon.tech',
        'neondb_owner',
        'ep-withered-pond',
        'channel_binding=require',
        'Neon Database'
    ]
    
    total_issues_found = 0
    for file_path in files_to_check:
        path = Path(file_path)
        if path.exists():
            content = path.read_text()
            file_issues = []
            for indicator in neon_indicators:
                if indicator in content:
                    file_issues.append(indicator)
            
            if file_issues:
                print(f"  ⚠️  {file_path} still contains Neon indicators: {file_issues}")
                total_issues_found += len(file_issues)
            else:
                print(f"  ✓ {file_path} - no Neon configurations found")
        else:
            print(f"  ~ {file_path} - does not exist (may be OK)")
    
    print(f"\n  Total Neon configuration issues found: {total_issues_found}")
    return total_issues_found == 0

def verify_no_duplicate_scripts():
    """Verify that duplicate scripts have been removed"""
    print_section("VERIFYING NO DUPLICATE SCRIPTS")
    
    root_scripts = [
        'setup_full_stack.sh',
        'start_dev_services.sh',
        'start_nginx.sh',
        'stop_services.sh'
    ]
    
    duplicates_found = 0
    for script in root_scripts:
        root_path = Path(f'./{script}')
        scripts_path = Path(f'./scripts/{script}')
        
        if root_path.exists():
            print(f"  ⚠️  {script} still exists in root directory")
            duplicates_found += 1
        else:
            print(f"  ✓ {script} - correctly removed from root")
        
        if scripts_path.exists():
            print(f"      {scripts_path} - preserved in scripts directory")
        else:
            print(f"      {scripts_path} - missing from scripts directory (ERROR!)")
            duplicates_found += 1
    
    print(f"\n  Total duplicate script issues: {duplicates_found}")
    return duplicates_found == 0

def verify_local_database_config():
    """Verify that database is configured for local use"""
    print_section("VERIFYING LOCAL DATABASE CONFIGURATION")
    
    env_files = [
        './config/environments/.env',
        './config/environments/.env.local'
    ]
    
    local_db_indicators = [
        'localhost',
        'postgres:admin@db:',
        'aghamazing_db',
        '5433:5432'  # Port mapping in docker-compose.override.yml
    ]
    
    issues_found = 0
    for file_path in env_files:
        path = Path(file_path)
        if path.exists():
            content = path.read_text()
            has_local_indicators = any(indicator in content for indicator in local_db_indicators)
            
            if has_local_indicators:
                print(f"  ✓ {file_path} - contains local database indicators")
            else:
                print(f"  ⚠️  {file_path} - may not be configured for local DB")
                issues_found += 1
        else:
            print(f"  ⚠️  {file_path} - does not exist")
            issues_found += 1
    
    # Check docker-compose files
    compose_file = Path('./docker-compose.yml')
    override_file = Path('./docker-compose.override.yml')
    
    if compose_file.exists():
        content = compose_file.read_text()
        if 'postgres:15' in content:
            print(f"  ✓ docker-compose.yml - configured for local PostgreSQL")
        else:
            print(f"  ⚠️  docker-compose.yml - may not be configured for local PostgreSQL")
            issues_found += 1
    
    if override_file.exists():
        content = override_file.read_text()
        if '5433:5432' in content:
            print(f"  ✓ docker-compose.override.yml - maps to local port 5433")
        else:
            print(f"  ⚠️  docker-compose.override.yml - may not map to local port 5433")
            issues_found += 1
    
    print(f"\n  Database configuration issues: {issues_found}")
    return issues_found == 0

def verify_clean_structure():
    """Verify the overall clean structure"""
    print_section("VERIFYING CLEAN PROJECT STRUCTURE")
    
    # Check that essential files exist
    essential_files = [
        'docker-compose.yml',
        'setup_full_stack.sh',  # Should be in root now (the original)
        'backend/manage.py',
        'frontend/package.json',
        'config/environments/.env',
        'config/environments/.env.local'
    ]
    
    missing_files = []
    for file_path in essential_files:
        path = Path(file_path)
        if path.exists():
            print(f"  ✓ {file_path}")
        else:
            print(f"  ✗ {file_path} - MISSING!")
            missing_files.append(file_path)
    
    # Check that bloat files are gone
    bloat_files = [
        'services.conf',  # Should be removed
        'aghamazingflutter-master'  # Was removed earlier
    ]
    
    bloat_remaining = []
    for file_path in bloat_files:
        path = Path(file_path)
        if path.exists():
            print(f"  ✗ {file_path} - STILL EXISTS (should be removed)!")
            bloat_remaining.append(file_path)
        else:
            print(f"  ✓ {file_path} - correctly removed")
    
    total_issues = len(missing_files) + len(bloat_remaining)
    print(f"\n  Structure issues: {total_issues} (missing: {len(missing_files)}, bloat: {len(bloat_remaining)})")
    return total_issues == 0

def main():
    """Run all verification checks"""
    print("🔍 Performing Final Verification of Local-Only CMS Setup")
    
    neon_clean = verify_no_neon_configs()
    duplicates_clean = verify_no_duplicate_scripts()
    db_config_ok = verify_local_database_config()
    structure_ok = verify_clean_structure()
    
    print_section("FINAL VERIFICATION RESULTS")
    
    results = [
        ("Neon configurations removed", neon_clean),
        ("Duplicate scripts cleaned", duplicates_clean),
        ("Local database configured", db_config_ok),
        ("Structure is clean", structure_ok)
    ]
    
    all_good = True
    for desc, ok in results:
        status = "✓ PASS" if ok else "✗ FAIL"
        print(f"  {status} - {desc}")
        if not ok:
            all_good = False
    
    print(f"\n  Overall status: {'✅ ALL GOOD' if all_good else '❌ ISSUES FOUND'}")
    
    if all_good:
        print("\n🎉 The CMS is now configured for pure local operation!")
        print("   - All Neon database configurations have been removed")
        print("   - Only local database settings remain")
        print("   - Duplicate files have been cleaned up")
        print("   - Project is optimized for local development")
    else:
        print("\n⚠️  There are still some issues to resolve.")
        print("   Please review the specific sections above for details.")
    
    return all_good

if __name__ == "__main__":
    main()