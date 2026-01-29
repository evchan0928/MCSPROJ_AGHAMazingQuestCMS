#!/usr/bin/env python
"""
Script to help set up PostgreSQL for AGHAMazingQuestCMS
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(cmd, description):
    """Helper function to run shell commands"""
    print(f"\n>>> {description}")
    print(f"Executing: {cmd}")
    
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            capture_output=True, 
            text=True, 
            cwd=Path(__file__).parent.parent
        )
        
        if result.returncode == 0:
            print("✅ Success!")
            if result.stdout.strip():
                print(result.stdout)
        else:
            print(f"❌ Error: {result.stderr}")
            
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return False

def main():
    print("🚀 Setting up PostgreSQL for AGHAMazingQuestCMS")
    print("=" * 50)
    
    # Check if virtual environment is active
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️ Warning: Virtual environment not detected. Please activate your virtual environment first:")
        print("  source venv/bin/activate")
        return 1
    
    print("\n📋 Prerequisites Check:")
    print("- PostgreSQL server installed and running")
    print("- Database user and database created")
    print("- Environment variables set in .env file")
    
    # Ask user to confirm they have these ready
    response = input("\nDo you have PostgreSQL installed and configured? (y/N): ")
    if response.lower() != 'y':
        print("\nPlease install and configure PostgreSQL first:")
        print("For Ubuntu/Debian: sudo apt install postgresql postgresql-contrib")
        print("Then create a database and user for the application")
        return 1
    
    # Check if .env file exists
    env_file = Path(__file__).parent.parent / ".env"
    if not env_file.exists():
        print(f"\n⚠️ Warning: {env_file} not found. Creating a template...")
        with open(env_file, 'w') as f:
            f.write("""# Database configuration
DB_ENGINE=postgres
DB_NAME=aghamazing_db
DB_USER=postgres
DB_PASSWORD=admin123
DB_HOST=localhost
DB_PORT=5432

# Django settings
DJANGO_SECRET_KEY=your_secure_secret_key_here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Supabase Auth (for frontend integration - optional)
# SUPABASE_URL=https://your_project_id.supabase.co
# SUPABASE_ANON_KEY=your_supabase_anon_key
""")
        print(f"Template .env file created at {env_file}")
        print("Please update it with your actual PostgreSQL credentials.")
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=env_file)
    
    # Verify PostgreSQL connection is configured
    db_engine = os.environ.get('DB_ENGINE', '')
    db_host = os.environ.get('DB_HOST', '')
    db_name = os.environ.get('DB_NAME', '')
    
    if db_engine.lower() not in ['postgres', 'postgresql'] or not db_host or not db_name:
        print("\n❌ Error: PostgreSQL not properly configured in environment variables.")
        print("Please ensure:")
        print("- DB_ENGINE=postgres in your .env file")
        print("- DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD are set")
        return 1
    
    print(f"\n✅ PostgreSQL configuration verified (host: {db_host}, db: {db_name})")
    
    # Run database migrations
    success = run_command(
        "python manage.py makemigrations",
        "Creating database migration files"
    )
    
    if not success:
        return 1
    
    success = run_command(
        "python manage.py migrate",
        "Applying database migrations to PostgreSQL"
    )
    
    if not success:
        return 1
    
    # Create superuser if requested
    create_user = input("\nWould you like to create a superuser? (Y/n): ")
    if create_user.lower() != 'n':
        success = run_command(
            "python manage.py createsuperuser",
            "Creating superuser account"
        )
        
        if not success:
            return 1
    
    # Show next steps
    print("\n🎉 PostgreSQL setup complete!")
    print("\n📋 Next Steps:")
    print("1. Connect to your database using pgAdmin4")
    print("2. Use the connection details from your .env file")
    print("3. Test the application by running both backend and frontend")
    print("4. Monitor database performance using pgAdmin4 tools")
    
    print("\n🔧 To run the application:")
    print("   # Backend: python manage.py runserver")
    print("   # Frontend: cd frontend && npm start")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())