import os
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

username = 'script_admin'
password = 'pass1234'
user, created = User.objects.get_or_create(username=username, defaults={'email': 'script@example.com', 'is_superuser': True, 'is_staff': True})
if created:
    user.set_password(password)
    user.save()
    print('Created superuser')
else:
    print('Superuser already exists')

refresh = RefreshToken.for_user(user)
access = str(refresh.access_token)

client = Client()

print('\nAnonymous GET /api/users/roles/')
resp = client.get('/api/users/roles/')
print(resp.status_code)
print(resp.content)

print('\nAuthenticated GET /api/users/roles/ with JWT')
resp2 = client.get('/api/users/roles/', HTTP_AUTHORIZATION=f'Bearer {access}')
print(resp2.status_code)
print(resp2.content)

print('\nDone')
