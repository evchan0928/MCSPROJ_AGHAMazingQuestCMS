#!/usr/bin/env python3
"""
Test script to verify Neon database connectivity and permissions
"""
import os
import sys
import django
from django.conf import settings

# Add backend to path
sys.path.insert(0, '/home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

def test_neon_connection_and_permissions():
    print("Testing Neon Database Connection and Permissions...")
    
    # Get database configuration
    from django.db import connection
    db_config = settings.DATABASES['default']
    
    print(f"Database: {db_config['NAME']}")
    print(f"Host: {db_config['HOST']}")
    print(f"Port: {db_config['PORT']}")
    print(f"Engine: {db_config['ENGINE']}")
    print(f"SSL Mode: {db_config['OPTIONS'].get('sslmode', 'Not set')}")
    
    try:
        # Test basic connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            result = cursor.fetchone()
            print(f"✓ Basic query test: {result}")
        
        # Try to check if we have permissions to access schemas
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name = 'public'
            """)
            schema_result = cursor.fetchone()
            if schema_result:
                print("✓ Can access 'public' schema")
            else:
                print("✗ Cannot access 'public' schema")
        
        # Check if we have permissions to create tables
        try:
            with connection.cursor() as cursor:
                cursor.execute("CREATE TABLE test_perms_check (id INTEGER);")
                print("✗ Can create tables (unexpected - permissions are too open)")
                # Clean up
                cursor.execute("DROP TABLE test_perms_check;")
        except Exception as e:
            print(f"✗ Cannot create tables: {str(e)}")
            print("  This is expected - you need to grant permissions to your Neon database user")
        
        # Check if Django migrations table exists
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'django_migrations'
                );
            """)
            migrations_table_exists = cursor.fetchone()[0]
            
            if migrations_table_exists:
                print("✓ Django migrations table exists")
            else:
                print("? Django migrations table does not exist (need to run migrate)")
        
        print("\n--- PERMISSIONS ISSUE DETECTED ---")
        print("Your Neon database user needs permissions to create tables in the 'public' schema.")
        print("Please execute the following SQL commands in your Neon console:")
        print()
        print("# Connect to your Neon project console and run:")
        print("GRANT CREATE ON SCHEMA public TO neondb_owner;")
        print("GRANT USAGE ON SCHEMA public TO neondb_owner;")
        print()
        print("Alternatively, you can grant all privileges:")
        print("GRANT ALL PRIVILEGES ON SCHEMA public TO neondb_owner;")
        print()
        print("After granting permissions, try running migrations again:")
        print("$ python manage.py migrate")
        
    except Exception as e:
        print(f"✗ Error during database test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_neon_connection_and_permissions()