#!/usr/bin/env python
"""
Script to reset admin user credentials in the database.
This ensures a clean admin account with known credentials.
"""
import os
import sys
import django
import subprocess

# Add the project root to the Python path
sys.path.append('/app')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.docker_compose_db')
django.setup()

from django.contrib.auth import get_user_model
from django.core.management import execute_from_command_line

User = get_user_model()

def reset_admin_credentials():
    """Reset the admin user credentials to known values."""
    print("Resetting admin credentials...")
    
    # Check if admin user exists
    try:
        admin_user = User.objects.get(username='admin')
        print(f"Found existing admin user: {admin_user.username}")
        
        # Update the password
        admin_user.set_password('admin123')
        admin_user.email = 'admin@admin.com'
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        print("Updated existing admin user credentials.")
        
    except User.DoesNotExist:
        print("Creating new admin user...")
        # Create a new admin user
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@admin.com',
            password='admin123',
            is_staff=True,
            is_active=True
        )
        print("Created new admin user with credentials:")
    
    print(f"Username: admin")
    print(f"Password: admin123")
    print(f"Email: admin@admin.com")
    print("Admin credentials reset successfully!")

if __name__ == "__main__":
    reset_admin_credentials()