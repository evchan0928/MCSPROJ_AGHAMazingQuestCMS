#!/usr/bin/env python
"""
Supabase Migration Script for AGHAMazingQuestCMS

This script helps migrate the database from a local PostgreSQL instance to Supabase.
"""

import os
import sys
from pathlib import Path

def check_environment():
    """Check if the environment is properly set up."""
    print("Checking environment...")
    
    # Check if .env file exists
    env_path = Path(".") / ".env"
    if not env_path.exists():
        print("❌ .env file not found!")
        return False
    
    print("✅ .env file exists")
    
    # Check if virtual environment is activated
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("✅ Virtual environment is active")
    else:
        print("⚠️  Virtual environment is not active, please activate it with: source venv/bin/activate")
        return False
        
    return True

def validate_supabase_config():
    """Validate the Supabase configuration in .env file."""
    print("\nValidating Supabase configuration...")
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    required_vars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {missing_vars}")
        print("\nPlease update your .env file with proper Supabase connection details:")
        print("# Supabase Database Configuration")
        print("# DB_NAME=your_supabase_db_name")
        print("# DB_USER=your_supabase_username") 
        print("# DB_PASSWORD=your_supabase_password")
        print("# DB_HOST=your-supabase-project-name.supabase.co")
        return False
    
    # Check if DB_HOST contains supabase.co
    db_host = os.getenv('DB_HOST')
    if 'supabase.co' not in db_host:
        print("⚠️  DB_HOST doesn't appear to be a Supabase URL. Please verify.")
        return False
    
    print("✅ Supabase configuration appears valid")
    return True

def test_connection():
    """Test connection to Supabase database."""
    print("\nTesting database connection...")
    
    import django
    from django.conf import settings
    
    # Initialize Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
    django.setup()
    
    from django.db import connection
    
    try:
        c = connection.cursor()
        print("✅ Successfully connected to Supabase database")
        return True
    except Exception as e:
        print(f"❌ Failed to connect to Supabase database: {e}")
        return False

def run_migrations():
    """Run Django migrations on Supabase database."""
    print("\nRunning database migrations on Supabase...")
    
    import django
    from django.conf import settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
    django.setup()
    
    from django.core.management import execute_from_command_line
    
    try:
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migrations completed successfully")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def main():
    """Main migration function."""
    print("🚀 AGHAMazingQuestCMS - Supabase Migration Tool")
    print("="*50)
    
    # Step 1: Check environment
    if not check_environment():
        print("\n❌ Environment check failed. Please fix the issues above and try again.")
        return 1
    
    # Step 2: Validate configuration
    if not validate_supabase_config():
        print("\n❌ Configuration validation failed. Please update your .env file with correct Supabase details.")
        return 1
    
    # Step 3: Test connection
    if not test_connection():
        print("\n❌ Connection test failed. Please verify your Supabase credentials.")
        return 1
    
    # Step 4: Run migrations
    if not run_migrations():
        print("\n❌ Migration process failed.")
        return 1
    
    print("\n🎉 Migration to Supabase completed successfully!")
    print("\nNext steps:")
    print("1. If you have existing data in your local database, you'll need to dump and import it:")
    print("   - pg_dump your current database")
    print("   - Import to Supabase using: psql \"your_supabase_connection_string\" -f your_dump.sql")
    print("2. Verify your application works with the new database")
    print("3. Update your deployment configuration to use the Supabase database")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())