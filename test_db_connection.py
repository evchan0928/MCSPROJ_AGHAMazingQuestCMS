#!/usr/bin/env python3
"""
Script to test database connection with Neon Cloud PostgreSQL
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv('/home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/.env')

# Add the backend directory to the path
sys.path.insert(0, '/home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend')

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')

import django
from django.conf import settings
from django.db import connection

def test_db_connection():
    django.setup()
    
    print("=== Database Configuration ===")
    db_settings = settings.DATABASES['default']
    print(f"Engine: {db_settings['ENGINE']}")
    print(f"Name: {db_settings['NAME']}")
    print(f"Host: {db_settings['HOST']}")
    print(f"Port: {db_settings['PORT']}")
    print(f"User: {db_settings['USER']}")
    print(f"SSL Mode: {db_settings['OPTIONS'].get('sslmode', 'not set')}")
    print(f"All Options: {db_settings['OPTIONS']}")
    
    print("\n=== Testing Database Connection ===")
    try:
        c = connection.cursor()
        print("✓ Successfully connected to the database!")
        
        # Check what tables exist
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            """)
            tables = [row[0] for row in cursor.fetchall()]
            
            print(f"\nFound {len(tables)} tables:")
            for table in tables:
                print(f"  - {table}")
                
        # Check migration status
        from django.core.management import execute_from_command_line
        from django.apps import apps
        
        print("\n=== Checking Migration Status ===")
        # We can't easily run showmigrations from code, so just report what we find
        app_configs = apps.get_app_configs()
        print(f"Registered apps: {[app.name for app in app_configs]}")
        
        c.close()
        
    except Exception as e:
        print(f"✗ Error connecting to database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_db_connection()