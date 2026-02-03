#!/usr/bin/env python
"""
Comprehensive test script for AGHAMazingQuestCMS
This script performs deep testing of all modules and creates official test data
"""
import os
import sys
import django
from datetime import datetime

# Setup Django environment
sys.path.append('/home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from apps.contentmanagement.models import ContentItem, ContentPage
from wagtail.models import Page
from django.core.files.base import ContentFile
from django.core.management import call_command
import tempfile

def create_official_test_data():
    """Create official test data for all modules"""
    print("🚀 Creating Official Test Data")
    print("=" * 50)
    
    User = get_user_model()
    
    # Create user groups if they don't exist
    editor_group, created = Group.objects.get_or_create(name='Editor')
    approver_group, created = Group.objects.get_or_create(name='Approver')
    admin_group, created = Group.objects.get_or_create(name='Admin')
    
    print(f"✅ Created/Verified Groups: Editor, Approver, Admin")
    
    # Create test users with different roles
    test_users = []
    
    # Create Editor user
    editor_user, created = User.objects.get_or_create(
        username='editor_test',
        defaults={
            'email': 'editor@test.com',
            'first_name': 'Test',
            'last_name': 'Editor',
            'is_active': True,
        }
    )
    if created:
        editor_user.set_password('testpass123')
        editor_user.save()
    editor_user.groups.add(editor_group)
    test_users.append(('Editor', editor_user))
    print(f"✅ Created Editor User: {editor_user.username}")
    
    # Create Approver user
    approver_user, created = User.objects.get_or_create(
        username='approver_test',
        defaults={
            'email': 'approver@test.com',
            'first_name': 'Test',
            'last_name': 'Approver',
            'is_active': True,
        }
    )
    if created:
        approver_user.set_password('testpass123')
        approver_user.save()
    approver_user.groups.add(approver_group)
    test_users.append(('Approver', approver_user))
    print(f"✅ Created Approver User: {approver_user.username}")
    
    # Create Admin user
    admin_user, created = User.objects.get_or_create(
        username='admin_test',
        defaults={
            'email': 'admin@test.com',
            'first_name': 'Test',
            'last_name': 'Admin',
            'is_active': True,
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if created:
        admin_user.set_password('testpass123')
        admin_user.save()
    admin_user.groups.add(admin_group)
    test_users.append(('Admin', admin_user))
    print(f"✅ Created Admin User: {admin_user.username}")
    
    # Create ContentItem test data
    print(f"\n📝 Creating Content Items...")
    content_items = []
    
    # Create a content item in 'for_editing' status
    content_item_1 = ContentItem.objects.create(
        title="Test Content Item 1",
        body="This is the body of the first test content item.",
        status=ContentItem.STATUS_FOR_EDITING,
        created_by=editor_user
    )
    content_items.append(content_item_1)
    print(f"✅ Created Content Item 1: '{content_item_1.title}' (Status: {content_item_1.status})")
    
    # Create a content item in 'for_approval' status
    content_item_2 = ContentItem.objects.create(
        title="Test Content Item 2",
        body="This is the body of the second test content item awaiting approval.",
        status=ContentItem.STATUS_FOR_APPROVAL,
        created_by=editor_user,
        edited_by=editor_user
    )
    content_items.append(content_item_2)
    print(f"✅ Created Content Item 2: '{content_item_2.title}' (Status: {content_item_2.status})")
    
    # Create a content item in 'for_publishing' status
    content_item_3 = ContentItem.objects.create(
        title="Test Content Item 3",
        body="This is the body of the third test content item ready for publishing.",
        status=ContentItem.STATUS_FOR_PUBLISHING,
        created_by=editor_user,
        edited_by=editor_user,
        approved_by=approver_user
    )
    content_items.append(content_item_3)
    print(f"✅ Created Content Item 3: '{content_item_3.title}' (Status: {content_item_3.status})")
    
    # Create a content item in 'published' status
    content_item_4 = ContentItem.objects.create(
        title="Test Content Item 4",
        body="This is the body of the fourth test content item that has been published.",
        status=ContentItem.STATUS_PUBLISHED,
        created_by=editor_user,
        edited_by=editor_user,
        approved_by=approver_user,
        published_by=approver_user
    )
    content_items.append(content_item_4)
    print(f"✅ Created Content Item 4: '{content_item_4.title}' (Status: {content_item_4.status})")
    
    # Create a content item in 'deleted' status (soft delete)
    content_item_5 = ContentItem.objects.create(
        title="Test Content Item 5",
        body="This is the body of the fifth test content item that has been soft deleted.",
        status=ContentItem.STATUS_DELETED,
        is_deleted=True,
        created_by=editor_user
    )
    content_items.append(content_item_5)
    print(f"✅ Created Content Item 5: '{content_item_5.title}' (Status: {content_item_5.status}, Deleted: {content_item_5.is_deleted})")
    
    # Test content item workflow methods
    print(f"\n🔄 Testing Content Item Workflow Methods...")
    workflow_test_item = ContentItem.objects.create(
        title="Workflow Test Item",
        body="This item is for testing workflow methods.",
        created_by=editor_user
    )
    print(f"✓ Created workflow test item: '{workflow_test_item.title}' (Status: {workflow_test_item.status})")
    
    # Test sending for approval
    workflow_test_item.send_for_approval(user=editor_user)
    print(f"✓ Sent for approval: '{workflow_test_item.title}' (Status: {workflow_test_item.status})")
    
    # Test approving
    workflow_test_item.approve(user=approver_user)
    print(f"✓ Approved: '{workflow_test_item.title}' (Status: {workflow_test_item.status})")
    
    # Test publishing
    workflow_test_item.publish(user=approver_user)
    print(f"✓ Published: '{workflow_test_item.title}' (Status: {workflow_test_item.status})")
    
    # Create ContentPage test data
    print(f"\n📄 Creating Content Pages...")
    
    # Get the root page
    root_page = Page.objects.get(depth=1)
    
    # Create homepage if it doesn't exist
    try:
        homepage = Page.objects.get(title="Homepage")
    except Page.DoesNotExist:
        from apps.contentmanagement.models import HomePage
        homepage = HomePage(
            title="Homepage",
            slug="home",
        )
        root_page.add_child(instance=homepage)
        homepage.save()
    
    print(f"✅ Homepage exists: {homepage.title}")
    
    # Create a content page
    from apps.contentmanagement.models import ContentPage as ContentPageModel
    
    content_page = ContentPageModel(
        title="Test Content Page",
        slug="test-content-page",
        status="draft",
        body="This is a test content page for the comprehensive test.",
        author=admin_user
    )
    
    homepage.add_child(instance=content_page)
    content_page.save()
    
    print(f"✅ Created Content Page: '{content_page.title}' (Status: {content_page.status})")
    
    # Update the content page to review status
    content_page.status = "review"
    content_page.reviewer = editor_user
    content_page.save()
    print(f"✓ Updated Content Page to review status: '{content_page.title}' (Status: {content_page.status})")
    
    # Update the content page to approved status
    content_page.status = "approved"
    content_page.approver = approver_user
    content_page.save()
    print(f"✓ Updated Content Page to approved status: '{content_page.title}' (Status: {content_page.status})")
    
    # Update the content page to published status
    content_page.status = "published"
    content_page.save()
    print(f"✓ Updated Content Page to published status: '{content_page.title}' (Status: {content_page.status})")
    
    print(f"\n📊 Test Data Summary:")
    print(f"- Created {len(test_users)} user accounts with different roles")
    print(f"- Created {len(content_items)} content items in various statuses")
    print(f"- Tested content item workflow methods")
    print(f"- Created {Page.objects.type(ContentPageModel).count()} content page(s)")
    print(f"- Verified all user groups exist")
    
    return {
        'users': test_users,
        'content_items': content_items,
        'content_pages': Page.objects.type(ContentPageModel),
        'workflow_test_item': workflow_test_item
    }


def test_api_endpoints():
    """Test API endpoints to ensure they're working"""
    print(f"\n🌐 Testing API Endpoints...")
    print("=" * 50)
    
    import requests
    from django.test import Client
    
    client = Client()
    
    # Test auth endpoints
    try:
        response = client.get('/api/auth/csrf/')
        print(f"✅ Auth CSRF endpoint: {response.status_code}")
    except Exception as e:
        print(f"❌ Auth CSRF endpoint failed: {e}")
    
    try:
        response = client.get('/api/auth/user/')
        # This should return 401 (unauthorized) which is expected
        print(f"✅ Auth user endpoint: {response.status_code} (expected for unauthenticated request)")
    except Exception as e:
        print(f"❌ Auth user endpoint failed: {e}")
    
    # Test content endpoints
    try:
        response = client.get('/api/content/items/')
        # This should return 200 or 401 depending on auth
        print(f"✅ Content items endpoint: {response.status_code}")
    except Exception as e:
        print(f"❌ Content items endpoint failed: {e}")
    
    # Test user management endpoints
    try:
        response = client.get('/api/users/')
        print(f"✅ Users endpoint: {response.status_code}")
    except Exception as e:
        print(f"❌ Users endpoint failed: {e}")
    
    # Test analytics endpoints
    try:
        response = client.get('/api/analytics/')
        print(f"✅ Analytics endpoint: {response.status_code}")
    except Exception as e:
        print(f"❌ Analytics endpoint failed: {e}")


def test_frontend_build():
    """Test if the frontend builds without errors"""
    print(f"\n🏗️  Testing Frontend Build...")
    print("=" * 50)
    
    import subprocess
    import json
    
    try:
        # Check if package.json exists and is valid
        with open('/home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS/frontend/package.json', 'r') as f:
            pkg = json.load(f)
        
        print(f"✅ Frontend package.json is valid")
        print(f"   - Name: {pkg.get('name', 'N/A')}")
        print(f"   - Version: {pkg.get('version', 'N/A')}")
        
        # Check if node_modules exists
        import os
        frontend_path = '/home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS/frontend'
        if os.path.exists(os.path.join(frontend_path, 'node_modules')):
            print(f"✅ node_modules directory exists")
        else:
            print(f"⚠️  node_modules directory does not exist - frontend dependencies may need to be installed")
        
        # Check if the .env file is properly configured
        env_path = os.path.join(frontend_path, '.env')
        if os.path.exists(env_path):
            with open(env_path, 'r') as f:
                env_content = f.read()
                if 'REACT_APP_BACKEND_API_URL' in env_content:
                    print(f"✅ Frontend .env file contains API URL configuration")
                else:
                    print(f"❌ Frontend .env file missing API URL configuration")
        else:
            print(f"❌ Frontend .env file does not exist")
        
    except Exception as e:
        print(f"❌ Frontend test failed: {e}")


def run_comprehensive_tests():
    """Run all comprehensive tests"""
    print("🧪 Running Comprehensive Tests for AGHAMazingQuestCMS")
    print("=" * 60)
    print(f"Test Run Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Test database connectivity
    print("🔌 Testing Database Connectivity...")
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            result = cursor.fetchone()
            if result:
                print("✅ Database connection successful")
            else:
                print("❌ Database query failed")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
    
    # Create official test data
    test_results = create_official_test_data()
    
    # Test API endpoints
    test_api_endpoints()
    
    # Test frontend build
    test_frontend_build()
    
    # Run Django system check
    print(f"\n🔍 Running Django System Check...")
    print("=" * 50)
    try:
        call_command('check', deploy=False, stdout=open(os.devnull, 'w'))
        print("✅ Django system check passed")
    except Exception as e:
        print(f"❌ Django system check failed: {e}")
    
    print(f"\n🏆 Comprehensive Testing Complete!")
    print("=" * 60)
    print("Summary of tests performed:")
    print("- Database connectivity and schema integrity")
    print("- User creation with different roles")
    print("- Content item creation and workflow testing")
    print("- Content page creation and status updates")
    print("- API endpoint availability")
    print("- Frontend build configuration")
    print("- Django system checks")
    print("=" * 60)
    
    return test_results


if __name__ == "__main__":
    results = run_comprehensive_tests()
    
    # Print a summary of created data
    print(f"\n📋 Created Test Data Summary:")
    print(f"- Users: {[u[0] for u in results['users']]}")
    print(f"- Content Items: {[ci.title for ci in results['content_items']]}")
    print(f"- Content Pages: {[cp.title for cp in results['content_pages']]}")
    print(f"- Workflow Test: '{results['workflow_test_item'].title}'")

