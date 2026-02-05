#!/usr/bin/env python
"""
Script to create a test user for the AGHAMazingQuestCMS application
"""
import os
import sys
import django

# Setup Django environment
sys.path.append('/home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

def create_test_user():
    User = get_user_model()
    
    # Check if user already exists
    if User.objects.filter(username='admin').exists():
        print("Admin user already exists.")
        return
    
    # Create superuser
    user = User.objects.create_superuser(
        username='admin',
        email='admin@aghamazingcms.com',
        password='admin123',
        first_name='Admin',
        last_name='User'
    )
    
    # Add to Super Admin group
    try:
        super_admin_group = Group.objects.get(name='Super Admin')
        user.groups.add(super_admin_group)
        print(f"Added admin user to Super Admin group")
    except Group.DoesNotExist:
        print("Super Admin group not found")
    
    print(f"Created admin user with ID: {user.id}")

if __name__ == "__main__":
    create_test_user()