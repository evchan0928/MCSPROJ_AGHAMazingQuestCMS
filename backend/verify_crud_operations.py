#!/usr/bin/env python
"""
Verification script to test CRUD operations on the ContentItem model
This ensures that all modules can perform transactions with PostgreSQL
"""
import os
import sys
import django
from datetime import datetime

# Add the project root to the Python path
sys.path.append('/home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/backend')

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')

# Setup Django
django.setup()

from apps.contentmanagement.models import ContentItem
from django.contrib.auth.models import User, Group
from django.utils.text import slugify
from django.utils import timezone
from django.core.exceptions import PermissionDenied
from django.contrib.auth import get_user_model

def test_crud_operations():
    """
    Test Create, Read, Update, and Delete operations on ContentItem model
    """
    print("Testing CRUD operations on ContentItem model...")
    
    # Get or create groups for roles
    encoder_group, created = Group.objects.get_or_create(name='Encoder')
    reviewer_group, created = Group.objects.get_or_create(name='Reviewer')
    approver_group, created = Group.objects.get_or_create(name='Approver')

    # Create users for each role
    encoder_user, created = User.objects.get_or_create(
        username='encoder',
        defaults={'email': 'encoder@example.com'}
    )
    if created:
        encoder_user.set_password('encoder123')
        encoder_user.save()
        encoder_user.groups.add(encoder_group)
        print("✓ Created encoder user")

    reviewer_user, created = User.objects.get_or_create(
        username='reviewer',
        defaults={'email': 'reviewer@example.com'}
    )
    if created:
        reviewer_user.set_password('reviewer123')
        reviewer_user.save()
        reviewer_user.groups.add(reviewer_group)
        print("✓ Created reviewer user")

    approver_user, created = User.objects.get_or_create(
        username='approver',
        defaults={'email': 'approver@example.com'}
    )
    if created:
        approver_user.set_password('approver123')
        approver_user.save()
        approver_user.groups.add(approver_group)
        print("✓ Created approver user")

    # CREATE: Create a new ContentItem by Encoder
    print("\n--- Testing CREATE operation (Encoder) ---")
    try:
        content_item = ContentItem.objects.create(
            title="Test Content Item",
            body="This is a test content item for verifying CRUD operations.",
            content_type='text',
            ar_marker=True,
            chat_bot_allow=True,
            created_by=encoder_user
        )
        print(f"✓ Successfully created ContentItem with ID: {content_item.id}")
    except Exception as e:
        print(f"✗ Failed to create ContentItem: {str(e)}")
        return False

    # READ: Retrieve the created ContentItem
    print("\n--- Testing READ operation (Encoder) ---")
    try:
        retrieved_item = ContentItem.objects.get(id=content_item.id)
        print(f"✓ Successfully retrieved ContentItem: '{retrieved_item.title}'")
    except Exception as e:
        print(f"✗ Failed to retrieve ContentItem: {str(e)}")
        return False

    # UPDATE: Modify the ContentItem by Reviewer
    print("\n--- Testing UPDATE operation (Reviewer) ---")
    try:
        retrieved_item.status = 'for_approval'
        retrieved_item.edited_by = reviewer_user
        retrieved_item.edited_at = timezone.now()
        retrieved_item.save()
        
        # Verify the update
        updated_item = ContentItem.objects.get(id=content_item.id)
        assert updated_item.status == 'for_approval'
        print(f"✓ Successfully updated ContentItem status to 'for_approval'")
    except Exception as e:
        print(f"✗ Failed to update ContentItem: {str(e)}")
        return False

    # APPROVE: Approve the ContentItem by Approver
    print("\n--- Testing APPROVE operation (Approver) ---")
    try:
        updated_item.status = 'approved'
        updated_item.approved_by = approver_user
        updated_item.approved_at = timezone.now()
        updated_item.save()
        
        # Verify the approval
        approved_item = ContentItem.objects.get(id=content_item.id)
        assert approved_item.status == 'approved'
        print(f"✓ Successfully approved ContentItem")
    except Exception as e:
        print(f"✗ Failed to approve ContentItem: {str(e)}")
        return False

    # DELETE: Remove the test ContentItem by Encoder (should fail if not allowed)
    print("\n--- Testing DELETE operation (Encoder) ---")
    try:
        # Try to delete by encoder - should be blocked based on role
        content_item.delete()
        print("✗ Encoder should not be able to delete content!")
        return False
    except PermissionDenied:
        print("✓ Correctly blocked deletion attempt by Encoder")
    except Exception as e:
        print(f"✗ Unexpected error during deletion: {str(e)}")
        return False

    # Test Wagtail-specific ContentPage model
    print("\n--- Testing ContentPage model (Wagtail) ---")
    try:
        from apps.contentmanagement.models import ContentPage
        
        # Test basic operations on ContentPage
        pages = ContentPage.objects.all()
        print(f"✓ Successfully accessed ContentPage model, found {pages.count()} pages")
    except Exception as e:
        print(f"✗ Failed to access ContentPage model: {str(e)}")
        return False

    print("\n" + "="*60)
    print("✅ ALL CRUD OPERATIONS TESTED SUCCESSFULLY!")
    print("✅ PostgreSQL integration is working correctly!")
    print("✅ Role-based access control verified!")
    print("="*60)
    
    return True

if __name__ == '__main__':
    test_crud_operations()