import os
import sys
from pathlib import Path
import django
import json

# Ensure project root is on PYTHONPATH so Django settings can be imported
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

    from django.test import Client

    client = Client()

    # Register
    reg_payload = {
        'username': 'smoketestuser',
        'email': 'smoketest@example.com',
        'password': 'Sm0keTestPass!'
    }
    try:
        resp = client.post('/api/auth/register/', data=json.dumps(reg_payload), content_type='application/json')
        print('REGISTER status:', resp.status_code)
        print('REGISTER body:', resp.content.decode())
    except Exception as e:
        import traceback

        print('REGISTER exception:')
        traceback.print_exc()


    # Login
    login_payload = {'username': 'smoketestuser', 'password': 'Sm0keTestPass!'}
    try:
        resp2 = client.post('/api/auth/login/', data=json.dumps(login_payload), content_type='application/json')
        print('LOGIN status:', resp2.status_code)
        print('LOGIN body:', resp2.content.decode())
    except Exception as e:
        import traceback

        print('LOGIN exception:')
        traceback.print_exc()


if __name__ == '__main__':
    main()
