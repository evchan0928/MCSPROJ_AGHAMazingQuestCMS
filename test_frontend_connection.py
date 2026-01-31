"""
Test script to verify frontend-backend connection
This script simulates the API calls that the frontend would make to the backend
"""

import os
import sys
import django
import requests
from urllib.parse import urljoin

# Setup Django environment
sys.path.append('/home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

def test_backend_endpoints():
    """Test that the backend endpoints are accessible and properly configured"""
    base_url = "http://172.19.91.23:8080/api"
    
    print("🔍 Testing Backend Endpoints")
    print("=" * 50)
    
    # Test endpoints that the frontend expects to exist
    endpoints_to_test = [
        "/auth/",
        "/content/items/",
        "/users/",
        "/analytics/"
    ]
    
    for endpoint in endpoints_to_test:
        full_url = base_url + endpoint
        print(f"\nTesting: {full_url}")
        
        try:
            # Test with OPTIONS to check if endpoint exists
            response = requests.options(full_url, timeout=10)
            print(f"  ✅ OPTIONS: {response.status_code}")
            
            # For auth endpoints, we expect different behavior than others
            if "auth" in endpoint:
                print(f"  📝 Authentication endpoint - expecting 405 for GET (this is normal)")
            else:
                # Try GET request for non-auth endpoints
                response_get = requests.get(full_url, timeout=10)
                print(f"  📊 GET: {response_get.status_code}")
                
                if response_get.status_code == 200:
                    print(f"  ✅ Endpoint is accessible and returning data")
                elif response_get.status_code == 401 or response_get.status_code == 403:
                    print(f"  ✅ Endpoint exists but requires authentication (expected)")
                else:
                    print(f"  ⚠️  Unexpected status code: {response_get.status_code}")
                    
        except requests.exceptions.ConnectionError:
            print(f"  ❌ Connection failed - backend may not be running on {full_url}")
        except requests.exceptions.Timeout:
            print(f"  ⏰ Timeout - backend may be slow to respond")
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("📋 Test Summary:")
    print("- Verify backend is running on http://0.0.0.0:8080")
    print("- Check that REACT_APP_BACKEND_API_URL matches the backend URL")
    print("- Confirm CORS settings allow requests from frontend origin")
    print("- Ensure authentication tokens are properly handled")


def test_database_connection():
    """Test the database connection from the backend perspective"""
    print("\n💾 Testing Database Connection")
    print("=" * 50)
    
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            result = cursor.fetchone()
            if result:
                print("✅ Database connection successful")
                
                # Check if content tables exist
                from django.apps import apps
                try:
                    content_app = apps.get_app_config('contentmanagement')
                    print("✅ Content management app loaded")
                    
                    # Check if we can access ContentItem model
                    from apps.contentmanagement.models import ContentItem
                    count = ContentItem.objects.count()
                    print(f"📊 Found {count} content items in database")
                    
                except Exception as e:
                    print(f"❌ Error accessing content models: {e}")
            else:
                print("❌ Database query failed")
                
    except Exception as e:
        print(f"❌ Database connection failed: {e}")


def test_cors_configuration():
    """Test if CORS is properly configured"""
    print("\n🛡️  Testing CORS Configuration")
    print("=" * 50)
    
    try:
        # Import CORS settings
        from config.settings.base import CORS_ALLOWED_ORIGINS
        print(f"Allowed origins: {CORS_ALLOWED_ORIGINS}")
        
        # Check if our frontend origin is in the list
        frontend_origin = "http://172.19.91.23:3000"
        if frontend_origin in CORS_ALLOWED_ORIGINS:
            print(f"✅ Frontend origin {frontend_origin} is allowed")
        else:
            print(f"❌ Frontend origin {frontend_origin} is NOT in allowed list")
            
        # Also check localhost for development
        localhost_origin = "http://localhost:3000"
        if localhost_origin in CORS_ALLOWED_ORIGINS:
            print(f"✅ Development origin {localhost_origin} is allowed")
        else:
            print(f"⚠️  Development origin {localhost_origin} is NOT in allowed list")
            
    except ImportError:
        print("❌ Could not import CORS settings")
    except Exception as e:
        print(f"❌ Error checking CORS: {e}")


if __name__ == "__main__":
    print("🚀 Testing Frontend-Backend Connection")
    print("This script verifies that the frontend can connect to the backend")
    print("")
    
    test_cors_configuration()
    test_database_connection()
    test_backend_endpoints()
    
    print("\n" + "=" * 50)
    print("🎉 Testing Complete!")
    print("Remember to start both the backend and frontend services")
    print("Backend: python manage.py runserver 0.0.0.0:8080")
    print("Frontend: cd frontend && npm start")