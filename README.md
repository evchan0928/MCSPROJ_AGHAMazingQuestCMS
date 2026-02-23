# AGHAMazingQuestCMS

Welcome to the AGHAMazingQuest Content Management System - a comprehensive Django-based platform for content management and user engagement.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Nginx Reverse Proxy Setup](#nginx-reverse-proxy-setup)
- [Neon Database Configuration](#neon-database-configuration)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL (if using local database)
- Git
- Nginx

## Quick Start

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AGHAMazingQuestCMS
   ```

2. Install dependencies:
   ```bash
   # Backend dependencies
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   
   # Frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. Start the full stack application:
   ```bash
   ./setup_full_stack.sh
   ```

4. Access the application:
   - Backend: http://localhost:8000
   - Admin: http://localhost:8000/admin
   - Frontend: http://localhost:3000

## Nginx Reverse Proxy Setup

For production deployments, we recommend using Nginx as a reverse proxy to serve both the React frontend and Django backend from a single domain/port.

### Setup Instructions

1. Install Nginx:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. Build the React frontend for production:
   ```bash
   cd frontend
   npm run build
   ```

3. Start the Django backend server:
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py runserver 127.0.0.1:8000
   ```

4. Configure Nginx with the provided configuration:
   ```bash
   sudo cp nginx-agha-proxy.conf /etc/nginx/sites-available/agha-cms
   sudo ln -sf /etc/nginx/sites-available/agha-cms /etc/nginx/sites-enabled/
   sudo nginx -t  # Test configuration
   sudo systemctl reload nginx  # Apply configuration
   ```

5. Access the application:
   - Main application: http://localhost:8080
   - API endpoints: http://localhost:8080/api/
   - Admin panel: http://localhost:8080/admin

### Configuration Details

The nginx configuration:
- Serves the React build files from `/`
- Proxies API requests from `/api` to the Django backend
- Proxies admin requests from `/admin` to the Django backend
- Serves static files from `/static/` (Django admin CSS, JS)
- Serves media files from `/media/` (uploaded content)
- Includes gzip compression for performance
- Includes security headers

## Neon Database Configuration

This project is configured to work with Neon Serverless PostgreSQL. Follow these steps to connect:

### 1. Activate Your Neon Database

Neon databases automatically pause after inactivity. Before connecting, ensure your database is active:

1. Visit your Neon Console: https://console.neon.tech/app/org-bold-base-96175683/projects
2. Sign in to your Neon account
3. Locate your project and ensure the database is in **Active** state (not paused)

### 2. Verify Your .env Configuration

Ensure your [.env](file:///home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/.env) file contains the correct Neon database configuration:

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
source venv/bin/activate
python manage.py migrate
```

### 5. Start the Application

```bash
cd ..
./setup_full_stack.sh
```

## Project Structure

```
AGHAMazingQuestCMS/
├── backend/                 # Django REST API
│   ├── apps/               # Custom applications
│   │   ├── contentmanagement/
│   │   ├── usermanagement/
│   │   └── mobilemanagement/
│   ├── config/             # Django settings
│   ├── static/             # Static files
│   └── manage.py
├── frontend/               # React frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── .env                    # Environment variables
├── setup_full_stack.sh     # Startup script
├── nginx-agha-proxy.conf   # Nginx configuration
└── README.md
```

## Environment Variables

Create a [.env](file:///home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/.env) file in the root directory with the following variables:

```
# Neon Database configuration via connection string
DATABASE_URL='postgresql://neondb_owner:npg_MBd91WOvLonZ@ep-withered-pond-a10vxojs-pooler.ap-southeast-1.aws.neon.tech/AGHAMazingQuestCMS?sslmode=require&channel_binding=require'

# Fallback local database configuration (when DATABASE_URL is not set)
DB_NAME=aghamazing_local_db
DB_USER=admin
DB_PASSWORD=password123
DB_HOST=localhost
DB_PORT=5432

# Django settings
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# CORS / CSRF settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:8000
```

## Troubleshooting

### Common Issues

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

### Nginx Reverse Proxy Issues
1. **Permission errors**: Ensure the `www-data` user can access the React build directory
2. **Configuration errors**: Run `sudo nginx -t` to validate the configuration
3. **Service not starting**: Check `sudo systemctl status nginx` for detailed error information

### Diagnostic Steps for Neon Connection Issues

1. **Confirm database is active** in Neon Console
2. **Check connection string** contains `sslmode=require&channel_binding=require`
3. **Verify psycopg2 version** supports channel binding
4. **Validate port** is 5432 (required for Neon)
5. **Grant schema permissions** to your database user

## Development

### Backend Development
1. Navigate to the backend directory
2. Activate virtual environment: `source venv/bin/activate`
3. Run development server: `python manage.py runserver`

### Frontend Development
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Start development server: `npm start`

## Deployment

For production deployment, ensure:
- `DEBUG=False` in Django settings
- Proper domain settings in `ALLOWED_HOSTS`
- Production-grade database (not SQLite)
- SSL/TLS certificates
- Static files served by a web server
- Nginx reverse proxy configured as described above