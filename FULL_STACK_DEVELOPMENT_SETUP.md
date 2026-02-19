# Full Stack Development Setup Guide

This guide provides comprehensive instructions for setting up the full-stack development environment for the Aghamazing Quest CMS project using a virtual environment (venv) only setup.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Environment Setup](#development-environment-setup)
3. [Backend Setup (Django)](#backend-setup-django)
4. [Frontend Setup (React)](#frontend-setup-react)
5. [Running the Applications](#running-the-applications)
6. [Database Setup](#database-setup)
7. [Environment Configuration](#environment-configuration)
8. [Project Structure](#project-structure)
9. [API Endpoints](#api-endpoints)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure your system meets these requirements:

### System Requirements
- **OS**: Linux, macOS, or Windows with WSL2
- **Git**: Version 2.25 or higher
- **Python**: Version 3.9 or higher
- **Node.js**: Version 16 or higher
- **PostgreSQL**: Version 12 or higher
- **Text Editor/IDE**: VSCode recommended

### Installation Commands

For Ubuntu/Debian:
```bash
sudo apt update
sudo apt install -y git python3 python3-pip python3-venv nodejs npm postgresql postgresql-contrib
```

For macOS:
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install prerequisites
brew install git python node postgresql
```

For Windows (WSL2):
```powershell
# In PowerShell as Administrator
wsl --install
# Then in WSL terminal:
sudo apt update && sudo apt install -y git python3 python3-pip python3-venv nodejs npm postgresql postgresql-contrib
```

## Repository Structure

```
MCSPROJ_AGHAMazingQuestCMS/
├── backend/
│   ├── apps/
│   │   ├── authentication/
│   │   ├── contentmanagement/
│   │   ├── usermanagement/
│   │   └── analyticsmanagement/
│   ├── config/
│   ├── middleware/
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── styles.css
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
├── devops/
│   ├── docker-compose-fullstack.yml
│   └── nginx-config/
│       └── agha-proxy.conf
└── docs/
    └── setup-guide.md
```

## Configuration Files

### Environment Variables (.env)

The project uses environment variables for configuration. Create a `.env` file in the repository root:

```env
# Database Configuration
DB_NAME=aghamazing_db
DB_USER=admin
DB_PASSWORD=password123
DB_HOST=localhost
DB_PORT=5432

# Django Configuration
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
CSRF_TRUSTED_ORIGINS=http://localhost:8080,http://localhost:8081

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret
```

### Docker Compose Configuration

The `devops/docker-compose-fullstack.yml` file orchestrates all services:

- **PostgreSQL**: Database server (port 5432)
- **pgAdmin**: Database administration (port 5050)
- **Backend**: Django API server (internal port 8000)
- **Frontend**: React development server (internal port 3000)
- **Nginx**: Reverse proxy (port 8081)

### Nginx Configuration

The `devops/nginx-config/agha-proxy.conf` file defines:

- API routes: `/api/` → Backend
- Admin panel: `/admin/` → Backend
- Static files: `/static/` → Backend
- All other routes: `/` → Frontend

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/MCSPROJ_AGHAMazingQuestCMS.git
cd MCSPROJ_AGHAMazingQuestCMS
```

### 2. Build and Start Services

```bash
cd devops
docker compose -f docker-compose-fullstack.yml up -d
```

### 3. Initial Database Setup

After starting the services, run migrations:

```bash
docker exec agha-backend python manage.py migrate
docker exec agha-backend python manage.py populate_sample_data
```

### 4. Access the Applications

- **Main Application**: http://localhost:8081
- **Sign-In Page**: http://localhost:8081/signin
- **API Documentation**: http://localhost:8081/api/swagger/
- **Django Admin**: http://localhost:8081/admin/
- **pgAdmin**: http://localhost:5050

### 5. Default Credentials

#### Demo Users
- Username: `demo_user` | Password: `demopass123`
- Username: `encoder_user` | Password: `demopass123`
- Username: `editor_user` | Password: `demopass123`
- Username: `approver_user` | Password: `demopass123`
- Username: `admin_user` | Password: `demopass123`
- Username: `superadmin` | Password: `superadmin123`

#### pgAdmin Credentials
- Email: `aghamazingdost@gmail.com`
- Password: `DOSTAGHAMazingQuestAdmin1234`

#### Database Connection (for direct access)
- Host: localhost
- Port: 5432
- Database: `aghamazing_db`
- Username: `admin`
- Password: `password123`

## Production Deployment

For production deployment, consider these additional configurations:

### Environment Configuration

```env
# Disable debug mode
DJANGO_DEBUG=False

# Set production-ready secret key
DJANGO_SECRET_KEY=your-production-secret-key

# Restrict allowed hosts
DJANGO_ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Production database settings
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
```

### SSL/TLS Configuration

Update nginx configuration for HTTPS:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # ... rest of configuration
}
```

### Performance Tuning

Adjust Gunicorn workers for production:

```bash
# In backend Dockerfile
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "config.wsgi:application"]
```

## Local Development Setup

Instead of using Docker Compose, this project can be run using native processes with Python virtual environments:

1. Backend setup:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver 8001
   ```

2. Frontend setup:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Running the Applications

To start the backend server:
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
python manage.py runserver 8001
```

To start the frontend development server:
```bash
cd frontend
npm start
```

## Database Setup

### Database Configuration

The project uses PostgreSQL as the database. Ensure PostgreSQL is installed and running.

### Database Initialization

1. Create a new database:
   ```bash
   createdb aghamazing_db
   ```

2. Create a new user with appropriate permissions:
   ```bash
   createuser -P admin
   psql -c "GRANT ALL PRIVILEGES ON DATABASE aghamazing_db TO admin;"
   ```

## Environment Configuration

### Environment Variables

Create a `.env` file in the repository root with the following content:

```
# Database Configuration
DB_NAME=aghamazing_db
DB_USER=admin
DB_PASSWORD=password123
DB_HOST=localhost
DB_PORT=5432

# Django Configuration
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
CSRF_TRUSTED_ORIGINS=http://localhost:8080,http://localhost:8081

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret
```

## Project Structure

```
MCSPROJ_AGHAMazingQuestCMS/
├── backend/
│   ├── apps/
│   │   ├── authentication/
│   │   ├── contentmanagement/
│   │   ├── usermanagement/
│   │   └── analyticsmanagement/
│   ├── config/
│   ├── middleware/
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── styles.css
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
├── devops/
│   ├── docker-compose-fullstack.yml
│   └── nginx-config/
│       └── agha-proxy.conf
└── docs/
    └── setup-guide.md
```

## API Documentation Access

### Accessing Swagger API Documentation in Development

With the Django development server running, you can access the API documentation via Swagger UI:

1. Start the Django development server:
   ```bash
   cd backend
   source venv/bin/activate  # Activate virtual environment
   python manage.py runserver
   ```

2. Navigate to the API documentation:
   - Open your browser
   - Go to `http://localhost:8000/api/swagger/` (or the port shown in your terminal output)
   
3. The Swagger UI will display all available API endpoints with interactive documentation.

### API Endpoints Available

After starting the development server, the following endpoints will be available:

- API Root: `http://localhost:8000/api/`
- API Documentation (Swagger): `http://localhost:8000/api/swagger/`
- Authentication: `http://localhost:8000/api/auth/`
- Content Management: `http://localhost:8000/api/content/`
- User Management: `http://localhost:8000/api/users/`
- Analytics: `http://localhost:8000/api/analytics/`
- Mobile Management: `http://localhost:8000/api/mobile/`

*Note: The actual port may vary (e.g., 8000, 8001, etc.) depending on availability. Check the terminal output when starting the server.*

## Troubleshooting

### Backend Issues

**Problem**: Database migration errors
**Solution**: 
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check that the database user has proper permissions (`CREATEDB`, `GRANT ALL PRIVILEGES`)

**Problem**: ImportError or module not found
**Solution**: Make sure your virtual environment is activated and all dependencies are installed

**Problem**: Port already in use
**Solution**: Change the port number in the runserver command (`python manage.py runserver 8002`)

### Frontend Issues

**Problem**: Cannot connect to backend API
**Solution**: 
- Verify `REACT_APP_BACKEND_API_URL` in frontend `.env` matches the backend address
- Check that the backend server is running

**Problem**: Module resolution errors
**Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Problem**: ESLint/linting errors
**Solution**: Run `npm run lint` to identify issues, or `npm run lint -- --fix` to auto-fix some issues

### General Issues

**Problem**: Permission errors
**Solution**: Ensure you're using a virtual environment and not installing packages globally

**Problem**: Environment variables not taking effect
**Solution**: 
- Restart your terminal after changing environment files
- For React, you may need to restart the development server after changing `.env`

This completes the comprehensive setup guide for AGHAMazingQuestCMS. The system is now ready for development, testing, and production deployment.