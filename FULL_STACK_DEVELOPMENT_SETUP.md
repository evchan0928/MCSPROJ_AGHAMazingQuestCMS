# Full Stack Development Setup Guide

This document provides comprehensive instructions for setting up and running the AGHAMazingQuestCMS full-stack application with Neon Serverless PostgreSQL integration.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Neon Database Configuration](#neon-database-configuration)
- [Starting the Application](#starting-the-application)
- [Troubleshooting](#troubleshooting)
- [Stopping Services](#stopping-services)

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.8+** (for Django backend)
- **Node.js 14+** (for React frontend)
- **Git** (for version control)
- **A modern web browser**

### Installation Commands

On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install python3 python3-pip nodejs npm git
```

On macOS (with Homebrew):
```bash
brew install python3 node npm git
```

On Windows (with Chocolatey):
```cmd
choco install python nodejs git
```

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AGHAMazingQuestCMS
```

### 2. Backend Setup

Navigate to the backend directory and set up the virtual environment:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

- On Linux/macOS:
  ```bash
  source venv/bin/activate
  ```
  
- On Windows:
  ```cmd
  venv\Scripts\activate
  ```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Return to the root directory:

```bash
cd ..
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Return to the root directory:

```bash
cd ..
```

## Neon Database Configuration

This project is configured to work with Neon Serverless PostgreSQL. Follow these steps to connect:

### 1. Activate Your Neon Database

Neon databases automatically pause after inactivity. Before connecting, ensure your database is active:

1. Visit your Neon Console: https://console.neon.tech/app/org-bold-base-96175683/projects
2. Sign in to your Neon account
3. Locate your project and ensure the database is in **Active** state (not paused)

### 2. Verify Your .env Configuration

The project comes with a pre-configured [.env](file:///home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/.env) file containing the Neon database connection string:

```
DATABASE_URL='postgresql://neondb_owner:npg_MBd91WOvLonZ@ep-withered-pond-a10vxojs-pooler.ap-southeast-1.aws.neon.tech/AGHAMazingQuestCMS?sslmode=require&channel_binding=require'
```

### 3. Grant Required Permissions

Even with the correct connection string, Neon databases may require explicit permissions. After activating your database:

1. Go to your Neon Console SQL Editor
2. Execute these commands:

```sql
GRANT CREATE ON SCHEMA public TO neondb_owner;
GRANT USAGE ON SCHEMA public TO neondb_owner;
```

**Important**: These commands must be executed directly in the Neon SQL Editor, not through your Django application.

### 4. Run Migrations

Once your Neon database is active and permissions are granted:

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py migrate
```

## Starting the Application

The project includes a comprehensive startup script that handles both backend and frontend services:

```bash
./setup_full_stack.sh
```

This script will:
1. Check prerequisites
2. Set up the backend environment
3. Run database migrations
4. Collect static files
5. Start the Django development server
6. Start the React development server
7. Display status information

### What Happens During Startup

1. **Backend Initialization**:
   - Checks if virtual environment exists
   - Installs/updates Python dependencies
   - Runs Django migrations
   - Collects static files
   - Starts Django development server on port 8000

2. **Frontend Initialization**:
   - Installs/updates Node.js dependencies
   - Starts React development server on port 3000
   - Sets up hot reloading

3. **Status Display**:
   - Shows running services and their status
   - Provides access URLs
   - Displays troubleshooting tips if needed

### Accessing the Application

Once the setup script completes successfully, you can access:

- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/
- **Frontend**: http://localhost:3000

## Troubleshooting

### Common Issues and Solutions

#### Connection Timeout to Neon Database
1. **Check if database is active**: Visit Neon Console and ensure database is not paused
2. **Verify SSL settings**: Confirm `sslmode=require` in your connection string
3. **Check psycopg2 version**: Ensure version ≥ 2.9.0 for channel binding support
4. **Pooler endpoint**: If using a pooler endpoint (URL contains `-pooler`), ensure connection pooling settings are compatible

#### Django Migration Failures
1. **Schema permissions**: Verify the database user has `CREATE` and `USAGE` permissions on the `public` schema
2. **Run migrations separately**: Try running migrations individually to isolate the issue
3. **Fake migrations**: If tables already exist but Django thinks they don't, use `python manage.py migrate --fake`

#### Admin Interface Not Loading
1. **MessageMiddleware**: Ensure `django.contrib.messages.middleware.MessageMiddleware` is in `MIDDLEWARE` setting
2. **Static files**: Run `python manage.py collectstatic` to ensure admin CSS/JS is available

#### Frontend Cannot Connect to Backend
1. **CORS settings**: Verify that CORS settings in Django allow the frontend origin
2. **Backend running**: Ensure the Django server is running on port 8000

### Diagnostic Steps for Neon Connection Issues

1. **Confirm database is active** in Neon Console
2. **Check connection string** contains `sslmode=require&channel_binding=require`
3. **Verify psycopg2 version** supports channel binding
4. **Validate port** is 5432 (required for Neon)
5. **Grant schema permissions** to your database user

## Stopping Services

To stop all running services, use the provided stop script:

```bash
./stop_services.sh
```

This will:
1. Identify running backend and frontend processes
2. Terminate them gracefully
3. Clean up any temporary files if necessary

## Development Tips

### Backend Development
- The Django development server auto-reloads when code changes
- API endpoints are documented at http://localhost:8000/api/
- Admin panel is available at http://localhost:8000/admin

### Frontend Development
- The React development server provides hot reloading
- API calls are proxied to the backend through the configured proxy
- Component updates are reflected immediately in the browser

### Database Changes
- Create Django models in the appropriate app under `apps/`
- Generate migrations: `python manage.py makemigrations`
- Apply migrations: `python manage.py migrate`
- Remember to activate your Neon database before running migrations

## Security Considerations

- Never commit sensitive information like database passwords or API keys to version control
- Use environment variables for all configuration values
- Ensure SSL mode is required for production databases
- Regularly update dependencies to patch security vulnerabilities