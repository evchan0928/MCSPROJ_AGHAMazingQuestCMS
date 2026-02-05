# Full Stack Setup Guide for AGHAMazingQuestCMS

This comprehensive guide covers the complete setup and configuration of the AGHAMazingQuestCMS application, which consists of a React frontend, Django/Wagtail backend, PostgreSQL database, and nginx reverse proxy.

## Architecture Overview

```
Internet -> nginx (Port 80/443) -> React Frontend & Django/Wagtail Backend
                     |
              -------------------
              |                 |
       Django/Wagtail      React App
       PostgreSQL          (Served by nginx)
```

## Components

### 1. Database Services (Docker Containers)

#### PostgreSQL Database
- **Container Name**: `agha-postgres`
- **Port**: 5439 (mapped from 5432)
- **Database Name**: `aghamazing_db`
- **Username**: `admin`
- **Password**: `password123`

#### pgAdmin4
- **Container Name**: `agha-pgadmin`
- **Access URL**: http://localhost:5050
- **Default Email**: admin@aghama.com
- **Default Password**: admin1234

### 2. Backend Service (Django/Wagtail)

#### Django Development Server
- **URL**: http://localhost:8000 (when running directly) or http://localhost (via nginx)
- **Admin Interface**: http://localhost:8000/admin/ or http://localhost/admin/
- **Wagtail Interface**: http://localhost:8000/cms/ or http://localhost/cms/
- **API Endpoint**: http://localhost:8000/api/ or http://localhost/api/

#### Authentication
- **JWT Tokens**: Used for API authentication
- **Access Token**: Expires in 15 minutes
- **Refresh Token**: Expires in 7 days
- **Pre-provisioned Users**: `admin` / `admin123`, `demo_user`, `encoder_user`, `editor_user`, `approver_user`

### 3. Frontend Service (React)

#### React Development Server
- **URL**: http://localhost:3000 (when running directly) or http://localhost (via nginx)
- **API Connection**: Points to nginx which proxies to http://localhost:8000
- **Environment Variable**: `REACT_APP_BACKEND_API_URL=http://localhost/api`

### 4. Reverse Proxy (nginx)

The nginx server acts as a reverse proxy that:
- Serves the React frontend for general requests
- Proxies API requests to the Django backend
- Handles admin and CMS interfaces
- Manages static and media files

#### Location Blocks
- `/api/` → Django backend API endpoints
- `/cms/` → Wagtail CMS administration
- `/admin/` → Django administration
- `/static/` → Django static files
- `/media/` → Django media files
- `/` → React frontend (catch-all)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MCSPROJ_AGHAMazingQuestCMS
```

### 2. Database Setup

Start the PostgreSQL database using Docker:

```bash
cd devops
docker-compose -f docker-compose-fullstack.yml up -d db
```

Wait for the database to be ready (may take 1-2 minutes).

### 3. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Activate the virtual environment:
```bash
source venv/bin/activate
```

3. Install dependencies (if not already installed):
```bash
pip install -r requirements.txt
```

4. Run database migrations:
```bash
python manage.py migrate
```

5. Create a superuser (optional, as test users are pre-provisioned):
```bash
python manage.py createsuperuser
```

6. Start the backend server:
```bash
python manage.py runserver 8000
```

### 4. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### 5. Nginx Setup

1. Install nginx (if not already installed):
```bash
sudo apt update
sudo apt install nginx
```

2. Configure nginx with the provided configuration:
```bash
sudo cp devops/deploy/nginx.conf /etc/nginx/sites-available/aghamazingquest
sudo ln -sf /etc/nginx/sites-available/aghamazingquest /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # Remove default site
sudo systemctl reload nginx
```

## Running the Application

### Development Mode (Individual Services)
1. Ensure database is running: `docker-compose -f docker-compose-fullstack.yml up -d db`
2. Ensure backend is running: `cd backend && source venv/bin/activate && python manage.py runserver 8000`
3. Ensure frontend is running: `cd frontend && npm start`
4. Access via nginx proxy: http://localhost

### Production Mode (Docker Compose with nginx)
```bash
cd devops
docker-compose -f docker-compose.production.yml up -d
```

## Authentication Flow

1. Access the application at http://localhost
2. Navigate to the login page
3. Enter credentials (e.g., `admin` / `admin123`)
4. The login API (`/api/auth/login/`) returns JWT tokens
5. Tokens are stored in localStorage (`access` and `refresh`)
6. Subsequent API calls include the Authorization header with the access token
7. When the access token expires, the refresh token is used to get a new access token

## Testing the Deployment

- Frontend: `curl -I http://localhost`
- API Login: `curl -X POST http://localhost/api/auth/login/ -H "Content-Type: application/json" -d '{"username":"admin", "password":"admin123"}'`
- Current User: `curl -H "Authorization: Bearer <access_token>" http://localhost/api/auth/me/`
- Content API: `curl -H "Authorization: Bearer <access_token>" http://localhost/api/content/items/`
- Admin: `curl -I http://localhost/admin/`
- CMS: `curl -I http://localhost/cms/`
- Roles: `curl -H "Authorization: Bearer <access_token>" http://localhost/api/users/roles/`

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Ensure Docker is running: `sudo systemctl status docker`
   - Verify database container is running: `docker ps | grep postgres`
   - Check database connectivity: `nc -zv localhost 5439`

2. **Backend Not Responding**:
   - Check if the backend is running: `curl -I http://localhost:8000/`
   - Verify the virtual environment is activated
   - Confirm dependencies are installed

3. **Frontend Not Loading**:
   - Check if the React server is running: `curl -I http://localhost:3000/`
   - Look for CORS errors in browser console
   - Verify environment variables are set correctly

4. **Authentication Issues**:
   - Clear browser localStorage before testing
   - Ensure using the correct login endpoint
   - Check that JWT tokens are being stored in localStorage

5. **Nginx Configuration Problems**:
   - Test nginx configuration: `sudo nginx -t`
   - Reload nginx after changes: `sudo systemctl reload nginx`
   - Check nginx logs: `sudo tail -f /var/log/nginx/error.log`

### Service Management

To stop all services:
1. Stop the frontend: `pkill -f "npm start"`
2. Stop the backend: `pkill -f "python manage.py runserver"`
3. Stop Docker containers: `docker-compose -f docker-compose-fullstack.yml down`

## Security Features

- JWT token-based authentication with limited lifetimes
- CSRF protection for state-changing operations
- Security headers implemented via nginx
- Input validation on both frontend and backend
- Secure password handling

## Production Considerations

For production deployment, consider:
- SSL/TLS termination with HTTPS
- Caching strategies for improved performance
- Rate limiting to prevent abuse
- Log rotation and monitoring
- Security hardening of all components
- Backup strategies for the database
- Container orchestration with Kubernetes for scaling