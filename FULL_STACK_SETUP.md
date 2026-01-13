# AGHAMazingQuestCMS - Full Stack Development Setup

This document explains how to run both the frontend and backend of the AGHAMazingQuestCMS simultaneously for full-stack development.

## Ports and Services

- **Backend (Django/Wagtail)**: Runs on `http://127.0.0.1:8000`
- **Frontend (React)**: Runs on `http://localhost:3000`
- **CORS Configuration**: Already configured to allow communication between the two

## Running Both Services Simultaneously

### Method 1: Using the Combined Script (Recommended)

We've provided a script that runs both services simultaneously:

```bash
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS
./scripts/run_both.sh
```

This script will:
- Start the Django/Wagtail backend on port 8000
- Start the React frontend on port 3000
- Handle both processes gracefully
- Allow you to stop both services with Ctrl+C

### Method 2: Running Manually in Separate Terminals

#### Terminal 1 - Backend:
```bash
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS
source venv/bin/activate
python manage.py runserver 8000
```

#### Terminal 2 - Frontend:
```bash
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/frontend
npm install  # Only needed the first time
npm start
```

## Communication Between Frontend and Backend

The system is already configured for frontend-backend communication:

- CORS is enabled for `http://localhost:3000` (the React dev server)
- The frontend can make API requests to the backend at `http://127.0.0.1:8000`
- Authentication tokens can be shared between the two domains
- API endpoints are accessible from the frontend

## Available Endpoints

### Backend Endpoints:
- Main site: `http://127.0.0.1:8000`
- Django Admin: `http://127.0.0.1:8000/admin/`
- Wagtail Admin: `http://127.0.0.1:8000/admin/`
- API endpoints: `http://127.0.0.1:8000/api/`

### Frontend Endpoints:
- Main site: `http://localhost:3000`
- Auto-refreshes on code changes
- Proxies API requests to backend when needed

## Default Credentials

- **Username**: admin
- **Password**: admin123

## Troubleshooting

### If the frontend can't connect to the backend:
1. Verify that the backend is running on port 8000
2. Check that CORS settings are properly configured in `config/settings/base.py`
3. Make sure both services are running simultaneously

### If you get dependency errors:
1. Make sure to run `npm install` in the frontend directory
2. Make sure to run `pip install -r requirements.txt` in the main directory

### If you get database errors:
1. Make sure you have run `python manage.py migrate`
2. Make sure the PostgreSQL service is running
3. Verify your .env file has the correct database credentials

## Stopping the Services

When using the combined script, press `Ctrl+C` to stop both services gracefully.

## Notes

- The backend and frontend run on separate ports to enable independent development
- The frontend communicates with the backend via API calls
- Changes to the backend require restarting the Django server
- Changes to the frontend trigger hot-reload automatically
- Both systems share authentication via JWT tokens