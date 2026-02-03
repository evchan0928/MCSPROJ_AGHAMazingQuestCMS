#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append('/home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()

# Create users for each role
test_users = [
    {"username": "encoder1", "email": "encoder1@example.com", "role": "Encoder", "password": "ComplexPass123!"},
    {"username": "editor1", "email": "editor1@example.com", "role": "Editor", "password": "ComplexPass123!"},
    {"username": "approver1", "email": "approver1@example.com", "role": "Approver", "password": "ComplexPass123!"},
    {"username": "admin1", "email": "admin1@example.com", "role": "Admin", "password": "ComplexPass123!"},
    {"username": "superadmin1", "email": "superadmin1@example.com", "role": "Super Admin", "password": "ComplexPass123!"},
]

created_users = []

for user_data in test_users:
    username = user_data["username"]
    email = user_data["email"]
    role_name = user_data["role"]
    password = user_data["password"]
    
    # Check if user already exists
    user, created = User.objects.get_or_create(username=username, defaults={
        'email': email,
        'first_name': role_name,
        'last_name': 'User'
    })
    
    if created:
        user.set_password(password)
        user.save()
        print(f"Created user: {username} with role: {role_name}")
    else:
        print(f"User {username} already exists, updating password")
        user.set_password(password)
        user.save()
    
    # Assign to the appropriate group
    try:
        group = Group.objects.get(name=role_name)
        user.groups.add(group)
        print(f"Added {username} to {role_name} group")
    except Group.DoesNotExist:
        print(f"Warning: Group {role_name} does not exist")
    
    created_users.append({
        "username": username,
        "password": password,
        "role": role_name
    })

print("\nTest users created successfully!")
print("Credentials:")
for user in created_users:
    print(f"  Username: {user['username']}, Password: {user['password']}, Role: {user['role']}")
    
# Also remind about the existing superuser
print(f"\nExisting superuser: admin (password: needs to be set during createsuperuser)")