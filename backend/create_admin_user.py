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

# Create a superuser if one doesn't exist
username = 'admin'
email = 'admin@example.com'
password = 'admin123'

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print(f'Superuser {username} created successfully!')
else:
    print(f'Superuser {username} already exists!')

# List all superusers
superusers = User.objects.filter(is_superuser=True)
print(f'Total superusers: {superusers.count()}')
for su in superusers:
    print(f'- Username: {su.username}, Email: {su.email}, Staff: {su.is_staff}')