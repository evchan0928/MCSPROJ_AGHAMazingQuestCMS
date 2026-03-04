import os
import sys
import django

# Add the project directory to Python path
sys.path.append('/home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend')

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.docker_db')

# Setup Django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Check if admin user exists
admin_user = User.objects.filter(username='admin').first()

if admin_user:
    print(f'User found: {admin_user.username}')
    print(f'Email: {admin_user.email}')
    print(f'Is staff: {admin_user.is_staff}')
    print(f'Is superuser: {admin_user.is_superuser}')
    print(f'Is active: {admin_user.is_active}')
    
    # Verify password
    is_valid = admin_user.check_password('admin123')
    print(f'Password "admin123" is valid: {is_valid}')
    
    # Try to authenticate the user
    from django.contrib.auth import authenticate
    authenticated_user = authenticate(username='admin', password='admin123')
    if authenticated_user:
        print(f'Authentication successful for user: {authenticated_user.username}')
    else:
        print('Authentication failed')
else:
    print('Admin user not found')
    
    # List all users
    all_users = User.objects.all()
    print(f'Total users: {all_users.count()}')
    for user in all_users:
        print(f'- Username: {user.username}, Email: {user.email}, Superuser: {user.is_superuser}')