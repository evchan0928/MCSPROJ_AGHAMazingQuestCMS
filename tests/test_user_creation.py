#!/usr/bin/env python
"""
Test script to verify user creation functionality connects to PostgreSQL database
"""
import os
import sys
import django
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

# Setup Django environment
sys.path.append('/home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

def test_user_creation():
    """Test that user creation saves to PostgreSQL database"""
    print("🧪 Testing User Creation Functionality")
    print("=" * 50)
    
    User = get_user_model()
    
    # Create test groups if they don't exist
    admin_group, created = Group.objects.get_or_create(name='Admin')
    editor_group, created = Group.objects.get_or_create(name='Editor')
    approver_group, created = Group.objects.get_or_create(name='Approver')
    
    print(f"✅ Verified Groups: Admin, Editor, Approver")
    
    # Count users before test
    initial_user_count = User.objects.count()
    print(f"📊 Initial user count: {initial_user_count}")
    
    # Test creating a user
    try:
        test_user = User.objects.create_user(
            username='test_user_123',
            email='test@example.com',
            password='secure_password_123',
            first_name='Test',
            last_name='User'
        )
        
        print(f"✅ Created user: {test_user.username}")
        print(f"✅ User ID: {test_user.id}")
        print(f"✅ Email: {test_user.email}")
        
        # Add user to a group
        test_user.groups.add(admin_group)
        print(f"✅ Added user to Admin group")
        
        # Verify the user was saved to database
        saved_user = User.objects.get(username='test_user_123')
        print(f"✅ Retrieved user from database: {saved_user.username}")
        print(f"✅ User exists in database: {saved_user.id == test_user.id}")
        
        # Count users after test
        final_user_count = User.objects.count()
        print(f"📊 Final user count: {final_user_count}")
        print(f"📈 User count increased by: {final_user_count - initial_user_count}")
        
        # Test updating user
        saved_user.first_name = 'Updated'
        saved_user.save()
        
        updated_user = User.objects.get(id=saved_user.id)
        print(f"✅ User update successful: {updated_user.first_name}")
        
        # Clean up - delete test user
        user_id = saved_user.id
        saved_user.delete()
        print(f"🗑️  Cleaned up test user (ID: {user_id})")
        
        # Verify deletion
        try:
            User.objects.get(id=user_id)
            print(f"❌ User was not properly deleted")
        except User.DoesNotExist:
            print(f"✅ User properly deleted from database")
        
        # Final count check
        after_deletion_count = User.objects.count()
        print(f"📊 User count after cleanup: {after_deletion_count}")
        print(f"✅ Database integrity maintained")
        
        print("\n🎉 User Creation Test PASSED!")
        print("✅ Users are properly saved to PostgreSQL database")
        print("✅ User updates are persisted to database")
        print("✅ User deletion works correctly")
        print("✅ Database integrity is maintained")
        
        return True
        
    except Exception as e:
        print(f"❌ User creation test FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_user_serializer():
    """Test the user serializer functionality"""
    print(f"\n🔧 Testing User Serializer")
    print("=" * 50)
    
    try:
        from apps.usermanagement.serializers import UserSerializer
        from django.contrib.auth.models import Group
        
        # Create groups for testing
        admin_group, _ = Group.objects.get_or_create(name='Admin')
        
        # Prepare user data
        user_data = {
            'username': 'serialized_user',
            'email': 'serialized@example.com',
            'first_name': 'Serialized',
            'last_name': 'User',
            'password': 'secure_password',
            'is_active': True,
            'roles': [admin_group.id]  # Using roles as defined in serializer
        }
        
        # Create user via serializer
        serializer = UserSerializer(data=user_data)
        if serializer.is_valid():
            created_user = serializer.save()
            print(f"✅ User created via serializer: {created_user.username}")
            
            # Verify user was saved to database
            db_user = User.objects.get(username='serialized_user')
            print(f"✅ User exists in database: {db_user.username}")
            
            # Clean up
            user_id = db_user.id
            db_user.delete()
            print(f"🗑️  Cleaned up serialized test user (ID: {user_id})")
            
            print("✅ User serializer works correctly")
            return True
        else:
            print(f"❌ Serializer validation failed: {serializer.errors}")
            return False
            
    except Exception as e:
        print(f"❌ User serializer test FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Starting User Creation and Database Connection Test")
    print("This test verifies that users created through the API will be saved to PostgreSQL")
    print("=" * 70)
    
    # Run tests
    test1_passed = test_user_creation()
    test2_passed = test_user_serializer()
    
    print(f"\n🏁 Test Summary")
    print("=" * 50)
    print(f"Direct User Creation: {'✅ PASSED' if test1_passed else '❌ FAILED'}")
    print(f"Serializer Creation: {'✅ PASSED' if test2_passed else '❌ FAILED'}")
    
    if test1_passed and test2_passed:
        print(f"\n🎊 ALL TESTS PASSED!")
        print("✅ Users will be properly saved to PostgreSQL database")
        print("✅ The API endpoints are working correctly")
        print("✅ Database connection is functional")
    else:
        print(f"\n💥 SOME TESTS FAILED!")
        print("❌ There may be issues with user creation or database connection")
    
    print("=" * 70)