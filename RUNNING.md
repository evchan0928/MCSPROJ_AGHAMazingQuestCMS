# Running the AGHAMazingQuestCMS Project

## Overview

This project is a Django/Wagtail-based content management system with a React frontend. The following services are running:

- **Backend API**: Django/Wagtail server running on `http://127.0.0.1:8000`
- **Frontend**: React development server running on `http://localhost:3000`

## Prerequisites

- Python 3.11
- Node.js and npm
- Virtual environment (recommended)

## Setup Instructions

### 1. Create and activate virtual environment:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install Python dependencies:

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m pip install python-dotenv
```

### 3. Set up environment variables:

A `.env` file is provided with default values. The application should work with the default settings.

### 4. Run database migrations:

```powershell
python manage.py migrate
```

### 5. Create a superuser account:

```powershell
$env:DJANGO_SUPERUSER_PASSWORD="admin123"
python manage.py createsuperuser --username admin --email admin@example.com --noinput
```

### 6. Create required roles:

```powershell
python manage.py create_content_roles
```

### 7. Collect static files:

```powershell
python manage.py collectstatic --noinput
```

### 8. Start the Django development server:

```powershell
python manage.py runserver 8000
```

### 9. Install and start the React frontend:

```powershell
cd frontend
npm install
npm start
```

## Accessing the Application

- **Frontend**: Open `http://localhost:3000` in your browser
- **Django Admin**: Open `http://127.0.0.1:8000/admin/` and log in with your superuser credentials
- **Wagtail Admin**: Open `http://127.0.0.1:8000/admin/` and log in with your superuser credentials

## Default Credentials

- **Username**: admin
- **Password**: admin123

## Project Structure

- `apps/` - Django applications for authentication, content management, user management, and analytics
- `config/` - Django settings and configuration
- `frontend/` - React frontend application
- `staticfiles/` - Collected static files
- `media/` - User-uploaded media files

## Additional Management Commands

- `python manage.py create_content_roles` - Creates the required user groups and permissions
- `python manage.py check` - Runs system checks
- `python manage.py shell` - Opens Django shell for debugging

## Notes

- The frontend and backend run on separate servers with different ports
- The frontend communicates with the backend via API calls to the Django server
- CORS is configured to allow communication between the frontend and backend
- The project uses JWT authentication for API endpoints