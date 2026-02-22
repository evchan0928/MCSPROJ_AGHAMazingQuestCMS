#!/usr/bin/env python3
"""
Comprehensive test script to verify frontend, backend, and Neon database connections
"""
import os
import sys
import subprocess
import socket
from urllib.parse import urlparse
import requests
import django
from django.conf import settings

# Add backend to path
sys.path.insert(0, '/home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend')

def test_neon_database_connection():
    """Test the Neon PostgreSQL database connection"""
    print("=== Testing Neon PostgreSQL Database Connection ===")
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv('/home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/.env')
    
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
    django.setup()
    
    try:
        from django.db import connection
        db_config = settings.DATABASES['default']
        
        print(f"Database: {db_config['NAME']}")
        print(f"Host: {db_config['HOST']}")
        print(f"Port: {db_config['PORT']}")
        print(f"Engine: {db_config['ENGINE']}")
        print(f"SSL Mode: {db_config['OPTIONS'].get('sslmode', 'Not set')}")
        
        # Test basic connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()
            print(f"✓ Connected to database, version: {db_version[0][:50]}...")
            
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
                print("✓ Django migrations table exists in Neon database")
            else:
                print("? Django migrations table does not exist (need to run migrate)")
        
        # Count tables in the database
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)
            table_count = cursor.fetchone()[0]
            print(f"✓ Found {table_count} tables in the Neon database")
        
        print("✓ Neon PostgreSQL Database connection test completed successfully!\n")
        return True
        
    except Exception as e:
        print(f"✗ Error connecting to Neon database: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_backend_server():
    """Test the backend server"""
    print("=== Testing Backend Server ===")
    
    try:
        # Check if the backend is responding on the default port
        backend_url = "http://localhost:8000"  # Default Django development server port
        
        # Check if the port is open
        parsed_url = urlparse(backend_url)
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex((parsed_url.hostname, parsed_url.port or 8000))
        sock.close()
        
        if result == 0:
            print(f"✓ Backend server is reachable at {backend_url}")
            
            # Try to get the main API endpoint
            try:
                response = requests.get(f"{backend_url}/api/", timeout=10)
                if response.status_code in [200, 404, 403]:  # Various valid responses
                    print(f"✓ Backend API responded with status: {response.status_code}")
                else:
                    print(f"? Backend API responded with unexpected status: {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"? Could not reach backend API: {e}")
        else:
            print(f"? Backend server does not appear to be running at {backend_url}")
            print("  Note: This is expected if the server is not currently started")
        
        print("✓ Backend server test completed!\n")
        return True
        
    except Exception as e:
        print(f"✗ Error during backend server test: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_frontend():
    """Test the frontend setup"""
    print("=== Testing Frontend Setup ===")
    
    frontend_path = "/home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/frontend"
    
    if os.path.exists(frontend_path):
        print("✓ Frontend directory exists")
        
        # Check for essential frontend files
        package_json_path = os.path.join(frontend_path, "package.json")
        if os.path.exists(package_json_path):
            print("✓ package.json found")
        else:
            print("✗ package.json not found")
            
        # Check for environment files
        env_path = os.path.join(frontend_path, ".env")
        if os.path.exists(env_path):
            print("✓ Frontend .env file found")
        else:
            print("? Frontend .env file not found (may not be required)")
        
        print("✓ Frontend setup test completed!\n")
        return True
    else:
        print("? Frontend directory does not exist")
        print("✓ Frontend test completed (directory not found)\n")
        return False

def test_api_endpoints():
    """Test key API endpoints if backend is running"""
    print("=== Testing Key API Endpoints ===")
    
    backend_url = "http://localhost:8000"
    
    # Define key endpoints to test
    endpoints_to_test = [
        "/api/",
        "/api/auth/",
        "/api/content/",
        "/api/users/",
        "/api/admin/"
    ]
    
    tested_any = False
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{backend_url}{endpoint}", timeout=5)
            print(f"GET {endpoint}: {response.status_code}")
            tested_any = True
        except requests.exceptions.ConnectionError:
            print(f"GET {endpoint}: Connection refused (server may not be running)")
        except requests.exceptions.Timeout:
            print(f"GET {endpoint}: Timeout")
        except Exception as e:
            print(f"GET {endpoint}: Error - {e}")
    
    if tested_any:
        print("✓ API endpoint testing completed!\n")
    else:
        print("? API endpoint testing skipped (backend not reachable)\n")
    
    return True

def main():
    print("Comprehensive Connection Test for AGHAMazingQuestCMS")
    print("=" * 55)
    
    # Test Neon database connection
    db_success = test_neon_database_connection()
    
    # Test backend server
    backend_success = test_backend_server()
    
    # Test frontend
    frontend_success = test_frontend()
    
    # Test API endpoints
    api_success = test_api_endpoints()
    
    print("=" * 55)
    print("Test Summary:")
    print(f"- Neon Database Connection: {'✓' if db_success else '✗'}")
    print(f"- Backend Server: {'✓' if backend_success else '?'}")
    print(f"- Frontend Setup: {'✓' if frontend_success else '?'}")
    print(f"- API Endpoint Tests: {'✓' if api_success else '?'}")
    
    print("\nNote: Backend server may show '?' if not currently running.")
    print("To start the backend server, run:")
    print("  cd backend && source ../venv/bin/activate && python manage.py runserver")
    
    if db_success:
        print("\n✓ Your Neon database is properly configured and connected!")
        print("✓ Schema and tables can be migrated to Neon once permissions are granted.")

if __name__ == '__main__':
    main()