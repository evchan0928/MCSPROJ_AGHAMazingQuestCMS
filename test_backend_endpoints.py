#!/usr/bin/env python3
"""
Test script to verify the Django backend API endpoints work correctly
with the Flutter app integration.
"""

import requests
import sys
import os
import subprocess

# Backend server URL
BASE_URL = "http://localhost:8000"

# API endpoints to test
ENDPOINTS = {
    "api_root": "/api/",
    "auth_login": "/api/auth/login/",
    "auth_register": "/api/auth/register/",
    "auth_me": "/api/auth/me/",
    "content_game": "/api/content/game/content/",
    "content_public": "/api/content/game/public-content/",
    "content_markers": "/api/content/ar-markers/"
}

def check_backend_running():
    """Check if the Django backend is running."""
    try:
        response = requests.get(f"{BASE_URL}/api/", timeout=5)
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        return False

def test_endpoint(endpoint, method="GET", data=None, headers=None):
    """Test a specific endpoint."""
    url = BASE_URL + endpoint
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=10)
        else:
            return {"status": "ERROR", "reason": f"Unsupported method: {method}"}
        
        return {
            "status": "SUCCESS" if response.status_code < 400 else "FAILED",
            "status_code": response.status_code,
            "response_time": response.elapsed.total_seconds()
        }
    except requests.exceptions.RequestException as e:
        return {"status": "ERROR", "reason": str(e)}

def main():
    print("Testing Django Backend API Endpoints for Flutter Integration")
    print("=" * 60)
    
    # Check if backend is running
    print(f"Checking if backend is running at {BASE_URL}...")
    if not check_backend_running():
        print(f"❌ Backend server does not appear to be running at {BASE_URL}")
        print("💡 Please start the backend server with: python manage.py runserver")
        return 1
    
    print("✅ Backend server is running!")
    print()
    
    # Test all endpoints
    results = {}
    for name, endpoint in ENDPOINTS.items():
        print(f"Testing {name} ({endpoint})...")
        result = test_endpoint(endpoint)
        results[name] = result
        
        if result["status"] == "SUCCESS":
            print(f"  ✅ Success - Status: {result['status_code']}, Time: {result['response_time']:.2f}s")
        else:
            print(f"  ❌ Failed - Status: {result.get('status_code', 'N/A')}, Reason: {result.get('reason', 'Unknown')}")
    
    print()
    print("Summary:")
    print("-" * 30)
    
    success_count = sum(1 for r in results.values() if r["status"] == "SUCCESS")
    total_count = len(results)
    
    for name, result in results.items():
        status_icon = "✅" if result["status"] == "SUCCESS" else "❌"
        print(f"{status_icon} {name}: {result['status']}")
    
    print()
    print(f"Overall: {success_count}/{total_count} endpoints working")
    
    if success_count == total_count:
        print("🎉 All endpoints are accessible! The Flutter app should be able to connect to the backend.")
        return 0
    else:
        print("⚠️  Some endpoints are not accessible. The Flutter app may have connection issues.")
        return 1

if __name__ == "__main__":
    sys.exit(main())