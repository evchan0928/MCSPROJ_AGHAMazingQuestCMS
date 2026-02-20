# AGHAMazingQuestCMS - Unified Full Stack Development Setup

This is the official, unified development setup guide for the AGHAMazingQuestCMS project. This document contains everything you need to set up and run the full-stack application reliably.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [System Setup](#system-setup)
3. [Project Cloning and Structure](#project-cloning-and-structure)
4. [Backend Setup (Django)](#backend-setup-django)
5. [Frontend Setup (React)](#frontend-setup-react)
6. [Database Configuration](#database-configuration)
7. [Environment Configuration](#environment-configuration)
8. [Running the Applications](#running-the-applications)
9. [API Documentation Access](#api-documentation-access)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

- **OS**: Linux, macOS, or Windows with WSL2
- **Git**: Version 2.25 or higher
- **Python**: Version 3.9 or higher
- **Node.js**: Version 18 or higher
- **npm**: Latest version (comes with Node.js)
- **PostgreSQL**: Version 12 or higher
- **Text Editor/IDE**: VSCode recommended

## System Setup

### For Ubuntu/Debian:
```bash
sudo apt update
sudo apt install -y git python3 python3-pip python3-venv nodejs npm postgresql postgresql-contrib
```

### For macOS:
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install prerequisites
brew install git python node postgresql
```

### For Windows (Recommended approach):
1. Install WSL2 with Ubuntu
2. Follow the Ubuntu/Debian instructions inside WSL2 terminal

## Project Cloning and Structure

Clone the repository:
```bash
git clone https://github.com/your-repo/MCSPROJ_AGHAMazingQuestCMS.git
cd MCSPROJ_AGHAMazingQuestCMS
```

Project structure:
```
MCSPROJ_AGHAMazingQuestCMS/
├── backend/                 # Django REST API backend
│   ├── apps/               # Custom Django apps
│   │   ├── authentication/
│   │   ├── contentmanagement/
│   │   ├── usermanagement/
│   │   └── analyticsmanagement/
│   ├── config/             # Django project settings
│   ├── middleware/
│   ├── static/             # Static files
│   ├── media/              # Media uploads
│   ├── requirements.txt    # Python dependencies
│   └── manage.py           # Django management script
├── frontend/               # React frontend application
│   ├── public/             # Public assets
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── api/            # API client code
│   │   └── utils/          # Utility functions
│   ├── package.json        # Node.js dependencies
│   └── .env                # Environment variables
└── FULL_STACK_DEVELOPMENT_SETUP.md # This file
```

## Backend Setup (Django)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a Python virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Verify your virtual environment is working:
```bash
python -c "import django; print(django.get_version())"
```

## Frontend Setup (React)

1. Open a new terminal window/tab and navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

## Database Configuration

### PostgreSQL Setup

1. Start PostgreSQL service:
   - **Ubuntu/Debian**: `sudo systemctl start postgresql`
   - **macOS**: `brew services start postgresql`

2. Create a database and user:
   - Switch to PostgreSQL superuser:
   ```bash
   sudo -u postgres psql
   ```
   
   - In the PostgreSQL prompt, run:
   ```sql
   CREATE DATABASE aghamazing_db;
   CREATE USER cms_user WITH PASSWORD 'secure_password123';
   ALTER ROLE cms_user SET client_encoding TO 'utf8';
   ALTER ROLE cms_user SET default_transaction_isolation TO 'read committed';
   ALTER ROLE cms_user SET timezone TO 'UTC';
   GRANT ALL PRIVILEGES ON DATABASE aghamazing_db TO cms_user;
   ALTER USER cms_user CREATEDB;
   \q
   ```

## Environment Configuration

### Backend Environment Variables

1. In the `backend` directory, create a `.env` file:
```env
# Database Configuration
DB_NAME=aghamazing_db
DB_USER=cms_user
DB_PASSWORD=secure_password123
DB_HOST=localhost
DB_PORT=5432

# Django Configuration
DJANGO_SECRET_KEY=your-super-secret-and-long-key-here-replace-this-default-value
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:8001

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-here-replace-this-default-value
```

### Frontend Environment Variables

1. In the `frontend` directory, create a `.env` file:
```env
# Backend API URL
REACT_APP_BACKEND_API_URL=http://localhost:8001

# WebSocket URL (if applicable)
REACT_APP_WS_URL=ws://localhost:8001/ws

# Other environment variables
GENERATE_SOURCEMAP=false
```

## Running the Applications

### Backend Server

1. Ensure you're in the `backend` directory with the virtual environment activated:
```bash
cd backend
source venv/bin/activate  # Only if you haven't already activated it
```

2. Run database migrations:
```bash
python manage.py migrate
```

3. Create a superuser account (optional but recommended):
```bash
python manage.py createsuperuser
```

4. Start the backend server on port 8001:
```bash
python manage.py runserver 8001
```

The backend API will be available at `http://localhost:8001/api/`

### Frontend Server

1. In a new terminal tab/window, navigate to the `frontend` directory:
```bash
cd frontend
```

2. Start the development server:
```bash
npm start
```

The frontend application will be available at `http://localhost:3000`

### Complete Development Workflow

For efficient development, we recommend using separate terminal windows/tabs:

**Terminal 1 (Backend)**:
```bash
cd /path/to/MCSPROJ_AGHAMazingQuestCMS/backend
source venv/bin/activate
python manage.py runserver 8001
```

**Terminal 2 (Frontend)**:
```bash
cd /path/to/MCSPROJ_AGHAMazingQuestCMS/frontend
npm start
```

## API Documentation Access

### Accessing Swagger API Documentation

Once your backend server is running:

1. Open your browser
2. Navigate to `http://localhost:8001/api/swagger/`
3. Explore the available API endpoints interactively

### Key API Endpoints

When running on port 8001, these endpoints will be available:

- API Root: `http://localhost:8001/api/`
- API Documentation (Swagger): `http://localhost:8001/api/swagger/`
- Authentication: `http://localhost:8001/api/auth/`
- Content Management: `http://localhost:8001/api/content/`
- User Management: `http://localhost:8001/api/users/`
- Analytics: `http://localhost:8001/api/analytics/`
- Mobile Management: `http://localhost:8001/api/mobile/`

## Troubleshooting

### Backend Issues

**Problem**: Database migration errors
**Solution**: 
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database credentials in your backend `.env` file
- Confirm database user has proper permissions

**Problem**: ImportError or module not found
**Solution**: Ensure your virtual environment is activated and all dependencies are installed:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Problem**: Port already in use
**Solution**: Change the port number in the runserver command:
```bash
python manage.py runserver 8002
```
Remember to update your frontend `.env` file accordingly.

### Frontend Issues

**Problem**: Cannot connect to backend API
**Solution**: 
- Verify `REACT_APP_BACKEND_API_URL` in frontend `.env` matches the backend address
- Check that the backend server is running
- Look for CORS errors in browser console

**Problem**: Module resolution errors
**Solution**: Delete `node_modules` and `package-lock.json`, then reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Application fails to start
**Solution**: Check that environment variables are set correctly and restart the development server

### General Issues

**Problem**: Permission errors
**Solution**: Ensure you're using a virtual environment for Python and have proper permissions for Node.js

**Problem**: Environment variables not taking effect
**Solution**: 
- Restart your terminal after changing environment files
- For React, restart the development server after changing `.env`

**Problem**: Unable to access the application
**Solution**: 
- Verify both servers are running
- Check that ports 3000 (frontend) and 8001 (backend) are available
- Ensure CORS settings allow communication between frontend and backend

## Important Notes

- Keep both the backend and frontend servers running during development
- Changes to backend code require restarting the Django server
- Changes to frontend code automatically reload in the browser
- Always use the virtual environment when working with the backend
- Store sensitive information in environment variables, never in code

This completes the unified setup guide for AGHAMazingQuestCMS. Your development environment is now ready for full-stack development!