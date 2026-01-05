import time
import requests


def wait_for_server(url, timeout=10):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            r = requests.get(url, timeout=1)
            return True
        except Exception:
            time.sleep(0.5)
    return False


def main():
    base = 'http://127.0.0.1:8001'
    if not wait_for_server(base + '/'): 
        print('Server did not start in time')
        return

    reg = {'username': 'apitest', 'email': 'apitest@example.com', 'password': 'Test12345'}
    r = requests.post(base + '/api/auth/register/', json=reg)
    print('REGISTER', r.status_code, r.text)

    login = {'username': 'apitest', 'password': 'Test12345'}
    r2 = requests.post(base + '/api/auth/login/', json=login)
    print('LOGIN', r2.status_code, r2.text)


if __name__ == '__main__':
    main()
