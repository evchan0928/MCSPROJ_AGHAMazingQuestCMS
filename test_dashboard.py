#!/usr/bin/env python3
"""
Test script to verify dashboard functionality
"""
import requests
import sys
import os

# Get the backend URL from environment or use default
BASE_URL = os.environ.get('BACKEND_URL', 'http://localhost')

def test_api_endpoint(endpoint, auth_token=None):
    """Test a single API endpoint"""
    url = f"{BASE_URL}/api{endpoint}"
    headers = {}
    if auth_token:
        headers['Authorization'] = f'Bearer {auth_token}'
    
    try:
        response = requests.get(url, headers=headers)
        print(f"✓ {endpoint}: {response.status_code}")
        if response.status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    print(f"  - Retrieved {len(data)} items")
                elif isinstance(data, dict):
                    print(f"  - Retrieved data keys: {list(data.keys())}")
            except ValueError:
                print(f"  - Non-JSON response: {response.text[:100]}...")
        else:
            print(f"  - Error: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"✗ {endpoint}: Failed to connect - {str(e)}")
        return False

def main():
    print("Testing AGHAMazingQuestCMS Dashboard Functionality\n")
    
    # Step 1: Authenticate to get token
    print("Step 1: Authenticating...")
    login_url = f"{BASE_URL}/api/auth/login/"
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        login_response = requests.post(login_url, json=login_data)
        if login_response.status_code == 200:
            token_data = login_response.json()
            access_token = token_data.get('access')
            print("✓ Authentication successful")
        else:
            print(f"✗ Authentication failed: {login_response.status_code}")
            print(f"  Error: {login_response.text}")
            return False
    except Exception as e:
        print(f"✗ Authentication failed: {str(e)}")
        return False
    
    print("\nStep 2: Testing Dashboard Endpoints...")
    
    # Test all dashboard-related endpoints
    endpoints_to_test = [
        "/users/dashboard/stats/",
        "/users/content/recent/",
        "/users/",
        "/users/roles/",
        "/analytics/",
        "/analytics/content/",
        "/analytics/users/"
    ]
    
    all_passed = True
    for endpoint in endpoints_to_test:
        success = test_api_endpoint(endpoint, access_token)
        if not success:
            all_passed = False
    
    print(f"\nDashboard functionality test: {'PASSED' if all_passed else 'FAILED'}")
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)