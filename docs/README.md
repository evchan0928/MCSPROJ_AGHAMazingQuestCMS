AGHAMazingQuestCMS — Deployment & Production Checklist

This project uses Django + Wagtail for the CMS and Django REST Framework for API endpoints. The frontend demo uses React (in `frontend/`).

This README contains a minimal checklist and example environment variables to run the project securely in production.

## Linux Setup

For Linux systems, please refer to the detailed setup instructions in the [environment_setup/linux/README.md](environment_setup/linux/README.md) file.

Quick setup on Linux:
```bash
# Make the setup script executable and run it
chmod +x environment_setup/linux/setup.sh
./environment_setup/linux/setup.sh
```

## Windows Setup

For Windows systems, the following commands can be used:

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

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker and Docker Compose
- Supabase account (if deploying to Supabase)

## Quick Start

1. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. Run database migrations:
   ```bash
   python manage.py migrate
   ```

4. Install frontend dependencies:
   ```bash
   cd frontend && npm install
   ```

5. Run the development servers:
   ```bash
   # Terminal 1: Start backend
   python manage.py runserver
   
   # Terminal 2: Start frontend
   cd frontend && npm start
   ```

Or use the convenience script:
```bash
./scripts/run_both.sh
```

## Deployment

### Using Docker
```bash
docker-compose up -d
```

### Environment Variables

Copy `.env.example` to `.env` and update the values accordingly.

## Project Structure

- `apps/` - Django applications
- `config/` - Django project settings
- `frontend/` - React frontend application
- `scripts/` - Utility scripts
- `deploy/` - Deployment configurations

## Available Scripts

- `scripts/run_backend.py` - Run the Django backend server
- `scripts/run_frontend.sh` - Run the React frontend server
- `scripts/run_both.sh` - Run both servers simultaneously

## Development Guidelines

Follow the standard Django and React development practices.
