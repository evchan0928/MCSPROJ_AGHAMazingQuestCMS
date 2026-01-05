AGHAMazingQuestCMS — Deployment & Production Checklist

This project uses Django + Wagtail for the CMS and Django REST Framework for API endpoints. The frontend demo uses React (in `frontend/`).

This README contains a minimal checklist and example environment variables to run the project securely in production.

1) Create and activate a virtual environment

Windows PowerShell:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

2) Run migrations and collectstatic

```powershell
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py collectstatic --noinput
```

3) Running the app

- Behind a production web server (recommended): use Gunicorn + Nginx (or similar). Ensure HTTPS is terminated by the load balancer or web server.
- For quick testing (not for production): `python manage.py runserver 0.0.0.0:8000` but ensure `DEBUG=True` only in development.

4) Notes about media and the mobile app

- Serve media (user-uploaded files) from a cloud storage bucket + CDN for performance. Configure `DEFAULT_FILE_STORAGE` and return absolute URLs from the API.
- For private/protected media, implement presigned URLs (S3) or short-lived signed URLs returned by an authenticated endpoint.
