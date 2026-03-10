#!/usr/bin/env python
"""
Cleanup Script to Remove Neon Database Configuration and Bloat Files

This script:
1. Removes Neon database configurations from files
2. Cleans up duplicate configuration files
3. Updates configurations to use local database only
4. Maintains essential local configuration files
"""

import os
import re
from pathlib import Path

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*60)
    print(f"{title:^60}")
    print("="*60)

def remove_neon_configurations():
    """Remove Neon database configurations from project files"""
    print_section("REMOVING NEON DATABASE CONFIGURATIONS")
    
    # Files that may contain Neon configurations
    files_with_neon = [
        Path('./README.md'),
        Path('./config/environments/.env.example'),
        Path('./backend/config/settings/base.py')
    ]
    
    for file_path in files_with_neon:
        if file_path.exists():
            try:
                content = file_path.read_text(encoding='utf-8')
                
                # Remove or replace Neon-specific configurations
                original_content = content
                
                # Replace Neon database URL with local database URL
                content = re.sub(
                    r'postgresql://neondb_owner:[^@]+@ep-[^\s\'"?]*\.aws-neon\.tech/[^\s\'"?]*(\?sslmode=require&channel_binding=require)?',
                    'postgresql://postgres:admin@db:5432/aghamazing_db',
                    content
                )
                
                # Replace Neon-specific database host
                content = content.replace(
                    'your-neon-db-host.aws-neon.tech',
                    'localhost'
                )
                
                # Remove Neon-specific instructions
                lines = content.splitlines()
                filtered_lines = []
                
                for line in lines:
                    # Skip lines with Neon-specific content
                    if not any(neon_term in line.lower() for neon_term in 
                              ['neon.tech', 'neon database', 'neon console', 'ep-withered-pond']):
                        filtered_lines.append(line)
                
                content = '\n'.join(filtered_lines)
                
                if content != original_content:
                    file_path.write_text(content, encoding='utf-8')
                    print(f"  ✓ Updated {file_path} - removed Neon configurations")
                else:
                    print(f"  ~ {file_path} - no Neon configurations found")
                    
            except Exception as e:
                print(f"  ✗ Failed to update {file_path}: {e}")

def clean_duplicate_scripts():
    """Remove duplicate scripts, keeping authoritative versions in scripts/ directory"""
    print_section("CLEANING DUPLICATE SCRIPTS")
    
    # Root directory scripts that are duplicated in scripts/ directory
    duplicate_scripts = [
        'setup_full_stack.sh',
        'start_dev_services.sh', 
        'start_nginx.sh',
        'stop_services.sh'
    ]
    
    for script_name in duplicate_scripts:
        root_script = Path(f'./{script_name}')
        scripts_script = Path(f'./scripts/{script_name}')
        
        if root_script.exists():
            # Compare file contents to confirm they are duplicates
            try:
                if scripts_script.exists():
                    root_content = root_script.read_text()
                    scripts_content = scripts_script.read_text()
                    
                    if root_content == scripts_content:
                        # They are identical, safe to remove root version
                        root_script.unlink()
                        print(f"  ✓ Removed duplicate {script_name} from root (keeping scripts/{script_name})")
                    else:
                        print(f"  ~ {script_name} differs between root and scripts/, keeping both")
                else:
                    print(f"  ~ {script_name} only exists in root, keeping it")
            except Exception as e:
                print(f"  ✗ Error comparing {script_name}: {e}")

def update_environment_configs():
    """Update environment configurations to use local database"""
    print_section("UPDATING ENVIRONMENT CONFIGURATIONS FOR LOCAL DB")
    
    env_files = [
        Path('./config/environments/.env'),
        Path('./config/environments/.env.local'),
        Path('./config/environments/.env.example')
    ]
    
    for env_file in env_files:
        if env_file.exists():
            try:
                content = env_file.read_text()
                
                # Replace Neon database URL with local PostgreSQL configuration
                updated_content = re.sub(
                    r'DATABASE_URL=.*neon\.tech.*',
                    'DATABASE_URL=postgresql://postgres:admin@db:5432/aghamazing_db',
                    content
                )
                
                # Update DB_HOST if it's set to Neon
                updated_content = re.sub(
                    r'DB_HOST=.*neon\.tech.*',
                    'DB_HOST=localhost',
                    updated_content
                )
                
                # Update DB settings for local
                updated_content = re.sub(
                    r'DB_HOST=.*your-neon-db-host.*',
                    'DB_HOST=localhost\nDB_PORT=5433\nDB_USER=postgres\nDB_PASSWORD=admin\nDB_NAME=aghamazing_db',
                    updated_content
                )
                
                if content != updated_content:
                    env_file.write_text(updated_content)
                    print(f"  ✓ Updated {env_file} for local database")
                else:
                    print(f"  ~ {env_file} already configured for local DB or no changes needed")
                    
            except Exception as e:
                print(f"  ✗ Failed to update {env_file}: {e}")

def clean_bloat_config_files():
    """Remove unnecessary configuration files"""
    print_section("REMOVING BLOAT CONFIGURATION FILES")
    
    # Check for any extra config files that might be bloat
    bloat_config_files = [
        Path('./services.conf')  # Empty config file
    ]
    
    removed_count = 0
    for config_file in bloat_config_files:
        if config_file.exists():
            if config_file.stat().st_size == 0:  # Empty file
                config_file.unlink()
                print(f"  ✓ Removed empty bloat file: {config_file}")
                removed_count += 1
            else:
                print(f"  ~ Kept {config_file} (not empty)")
    
    print(f"  Total bloat config files removed: {removed_count}")

def verify_local_setup():
    """Verify that the setup is now configured for local use"""
    print_section("VERIFYING LOCAL SETUP")
    
    essential_local_files = [
        'docker-compose.yml',
        'config/environments/.env',
        'config/environments/.env.local'
    ]
    
    for file_path in essential_local_files:
        path = Path(file_path)
        if path.exists():
            print(f"  ✓ {file_path}")
        else:
            print(f"  ✗ {file_path} - MISSING!")
    
    # Check docker-compose for local configuration
    docker_compose = Path('./docker-compose.yml')
    if docker_compose.exists():
        content = docker_compose.read_text()
        if 'postgres:15' in content and '5433:5432' in content:
            print("  ✓ docker-compose.yml configured for local PostgreSQL")
        else:
            print("  ~ docker-compose.yml may need review for local DB config")

def main():
    """Main function to run all cleanup operations"""
    print("🧹 Starting AGHAMazingQuestCMS Local-Only Cleanup Process")
    
    remove_neon_configurations()
    clean_duplicate_scripts()
    update_environment_configs()
    clean_bloat_config_files()
    verify_local_setup()
    
    print_section("CLEANUP COMPLETE")
    print("The project has been cleaned of Neon database configurations")
    print("and unnecessary bloat files. It is now configured to work")
    print("purely on a local machine.")

if __name__ == "__main__":
    main()