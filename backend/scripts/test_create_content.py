import os
import sys

# Ensure project root is on path
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
import django
# Ensure testserver is allowed (DRF test client uses 'testserver' host)
os.environ.setdefault('DJANGO_ALLOWED_HOSTS', 'testserver,localhost,127.0.0.1')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()

username = 'apitestuser'
password = 'testpassword123'
user, created = User.objects.get_or_create(username=username, defaults={'email': 'apitest@example.com'})
if created:
    user.set_password(password)
    user.is_staff = True
    user.save()
    print('Created test user')
else:
    # ensure password is set for consistency
    user.set_password(password)
    user.save()

# Ensure the test user is in the 'Encoder' group so they can create content
from django.contrib.auth.models import Group
group, _ = Group.objects.get_or_create(name='Encoder')
if not user.groups.filter(name='Encoder').exists():
    user.groups.add(group)
    print('Added test user to Encoder group')

client = APIClient()
client.force_authenticate(user=user)

# Build multipart payload
file_content = b'This is a test file.'
simple_file = SimpleUploadedFile('test.txt', file_content, content_type='text/plain')

payload = {
    'title': 'APIClient Test Content',
    'body': 'This content was created by a local test script.',
    'content_type': 'text',
    'file': simple_file,
}

response = client.post('/api/content/items/', payload, format='multipart')

print('Status code:', response.status_code)
print('Response data:', response.data)

if response.status_code >= 400:
    # If the response contains server-side error information in JSON, print it
    try:
        import json
        print('Raw content:', response.content.decode('utf-8'))
    except Exception:
        pass

sys.exit(0)
