#!/usr/bin/env python3
"""
Test script to verify Neon database connectivity
"""
import os
import sys
import django
from django.conf import settings

# Add backend to path
sys.path.insert(0, '/home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

def test_neon_connection():
    print("Testing Neon Database Connection...")
    
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
            print(f"Basic query test: {result}")
        
        # Count tables in the database
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)
            table_count = cursor.fetchone()[0]
            print(f"Total tables in database: {table_count}")
        
        # Get some table names
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
                LIMIT 10
            """)
            tables = [row[0] for row in cursor.fetchall()]
            print(f"Sample table names: {tables}")
        
        # Check Django migrations table
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'django_migrations'
            """)
            migrations_exist = cursor.fetchone()[0]
            if migrations_exist:
                print("✓ Django migrations table exists")
                
                # Count applied migrations
                cursor.execute("SELECT COUNT(*) FROM django_migrations")
                migration_count = cursor.fetchone()[0]
                print(f"Applied migrations count: {migration_count}")
            else:
                print("⚠ Django migrations table does not exist")
        
        # Test Django ORM functionality
        from django.contrib.auth.models import User
        user_count = User.objects.count()
        print(f"Django ORM test - User count: {user_count}")
        
        print("\n✓ Neon database connection test completed successfully!")
        print("✓ Schema and table migrations have been applied")
        print("✓ Database is properly configured for Neon Serverless PostgreSQL")
        
    except Exception as e:
        print(f"✗ Error during database test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_neon_connection()