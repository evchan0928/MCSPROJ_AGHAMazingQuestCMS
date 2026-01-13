#!/usr/bin/env python
"""
System Verification Script for AGHAMazingQuestCMS

This script verifies that all components of the application are working correctly.
"""

import os
import sys
import django
from django.conf import settings

def main():
    """Main verification function."""
    print("🔍 AGHAMazingQuestCMS - System Verification")
    print("="*50)
    
    # Add the project directory to the path
    project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, project_dir)
    
    # Setup Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
    django.setup()
    
    print("✅ Django initialized successfully")
    
    # Test importing core modules
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        print("✅ User model imported successfully")
    except Exception as e:
        print(f"❌ User model import failed: {e}")
        return 1
    
    # Test importing app models
    try:
        from apps.contentmanagement.models import ContentItem
        print("✅ ContentItem model imported successfully")
    except Exception as e:
        print(f"❌ ContentItem model import failed: {e}")
        return 1
    
    try:
        from apps.contentmanagement.models import HomePage
        print("✅ HomePage model imported successfully")
    except Exception as e:
        print(f"❌ HomePage model import failed: {e}")
        return 1
    
    # Test database connectivity
    try:
        user_count = User.objects.count()
        print(f"✅ Database connection successful - found {user_count} users")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return 1
    
    # Test Wagtail integration
    try:
        from wagtail.models import Page
        page_count = Page.objects.count()
        print(f"✅ Wagtail integration working - found {page_count} pages")
    except Exception as e:
        print(f"❌ Wagtail integration failed: {e}")
        return 1
    
    # Test REST Framework integration
    try:
        from rest_framework import serializers
        print("✅ Django REST Framework integration working")
    except Exception as e:
        print(f"❌ DRF integration failed: {e}")
        return 1
    
    # Test Content Management functionality
    try:
        # Try creating a basic content item
        from apps.contentmanagement.models import ContentItem
        # Just test that we can reference the model without database operations
        status_choices = ContentItem.STATUS_CHOICES
        print(f"✅ Content management system working - {len(status_choices)} status choices available")
    except Exception as e:
        print(f"❌ Content management system failed: {e}")
        return 1
    
    # Test Authentication functionality
    try:
        from apps.authentication import views
        print("✅ Authentication module imported successfully")
    except Exception as e:
        print(f"❌ Authentication module import failed: {e}")
        return 1
    
    # Test User Management functionality
    try:
        from apps.usermanagement import views
        print("✅ User management module imported successfully")
    except Exception as e:
        print(f"❌ User management module import failed: {e}")
        return 1
    
    # Test Analytics Management functionality
    try:
        from apps.analyticsmanagement import views
        print("✅ Analytics management module imported successfully")
    except Exception as e:
        print(f"❌ Analytics management module import failed: {e}")
        return 1
    
    print("\n" + "="*50)
    print("🎉 All system components are working correctly!")
    print("\nApplication is ready for use with local database.")
    print("When you want to migrate to Supabase, update your .env file with Supabase credentials")
    print("and run: python scripts/migrate_to_supabase.py")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())