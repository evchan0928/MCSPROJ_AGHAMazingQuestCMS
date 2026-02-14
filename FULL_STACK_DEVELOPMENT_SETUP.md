# Full Stack Development Setup Guide: AGHAMazingQuestCMS

This comprehensive guide covers the setup, deployment, and optimization of the AGHAMazingQuestCMS - a full-stack content management system built with Django REST Framework backend and React frontend, deployed via Docker containers with Nginx reverse proxy.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Repository Structure](#repository-structure)
4. [Configuration Files](#configuration-files)
5. [Development Setup](#development-setup)
6. [Production Deployment](#production-deployment)
7. [API Endpoints](#api-endpoints)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)
10. [Performance Optimization](#performance-optimization)

## Architecture Overview

The AGHAMazingQuestCMS follows a modern full-stack architecture:

```
Internet → Nginx Reverse Proxy → React Frontend (port 3000)
                              → Django Backend (port 8000)
                              → PostgreSQL Database
                              → pgAdmin (port 5050)
```

Key components:
- **Frontend**: React application with modern UI/UX
- **Backend**: Django REST Framework API with JWT authentication
- **Database**: PostgreSQL for data persistence
- **Admin Interface**: pgAdmin for database management
- **Reverse Proxy**: Nginx for routing and security
- **Authentication**: JWT-based with refresh token rotation
- **API Documentation**: Swagger/Redoc integration

## Prerequisites

Before starting, ensure your system meets these requirements:

### System Requirements
- **OS**: Linux, macOS, or Windows with WSL2
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: Version 2.25 or higher
- **Node.js**: Version 16 or higher (for local development)
- **Python**: Version 3.9 or higher (for local development)

### Installation Commands

For Ubuntu/Debian:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose git
sudo usermod -aG docker $USER  # Add current user to docker group
```

For macOS:
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install prerequisites
brew install docker docker-compose git
```

For Windows (WSL2):
```powershell
# In PowerShell as Administrator
wsl --install
# Then in WSL terminal:
sudo apt update && sudo apt install -y docker.io docker-compose git
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

- **PostgreSQL**: Database server (port 5433)
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
- Port: 5433
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

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/refresh/` - Token refresh
- `GET /api/auth/me/` - Get current user

### Content Management
- `GET /api/content/items/` - List content items
- `POST /api/content/items/` - Create content item
- `GET /api/content/items/{id}/` - Retrieve content item
- `PUT /api/content/items/{id}/` - Update content item
- `DELETE /api/content/items/{id}/` - Delete content item
- `POST /api/content/items/{id}/send_for_approval/` - Send for approval
- `POST /api/content/items/{id}/approve/` - Approve content
- `POST /api/content/items/{id}/publish/` - Publish content

### User Management
- `GET /api/users/` - List users
- `POST /api/users/` - Create user
- `GET /api/users/{id}/` - Retrieve user
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

### Analytics
- `GET /api/analytics/` - Get analytics summary
- `GET /api/analytics/content/` - Get content analytics
- `GET /api/analytics/users/` - Get user activity analytics
- `POST /api/analytics/generate/` - Generate analytics report

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
If you encounter port conflicts:
```bash
# Check which process is using the port
lsof -i :8081

# Kill the process if needed
kill -9 PID
```

#### 2. Database Connection Errors
```bash
# Check if PostgreSQL is running
docker compose -f docker-compose-fullstack.yml ps

# Check database logs
docker logs agha-postgres

# Retry migrations
docker exec agha-backend python manage.py migrate
```

#### 3. Frontend Build Issues
```bash
# Clear npm cache
docker exec agha-frontend npm cache clean --force

# Reinstall dependencies
docker exec agha-frontend npm install
```

#### 4. Authentication Problems
- Verify CSRF_TRUSTED_ORIGINS includes your domain
- Check that ALLOWED_HOSTS includes your domain
- Ensure session cookies are configured correctly for your domain

### Debugging Tips

1. **Check Container Logs**:
   ```bash
   docker logs agha-backend
   docker logs agha-frontend
   docker logs agha-nginx
   ```

2. **Verify Environment Variables**:
   ```bash
   docker exec agha-backend env | grep DB_
   ```

3. **Test API Directly**:
   ```bash
   curl -v http://localhost:8081/api/
   ```

## Security Considerations

### Authentication & Authorization
- JWT tokens with 15-minute expiration
- Refresh tokens with 7-day expiration
- Token rotation for refresh tokens
- Session management with CSRF protection

### Data Protection
- PostgreSQL with encrypted connections
- Environment variables for sensitive data
- Input validation and sanitization
- SQL injection prevention

### Network Security
- Nginx reverse proxy for attack mitigation
- CORS configuration limiting origins
- Rate limiting for API endpoints
- SSL/TLS termination at proxy level

## Performance Optimization

### Caching Strategy
- Redis for session storage (future implementation)
- Browser caching for static assets
- CDN for media files (future implementation)

### Database Optimization
- PostgreSQL connection pooling
- Query optimization with select_related/prefetch_related
- Proper indexing strategy
- Regular vacuuming and maintenance

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization and compression
- Bundle size optimization
- Caching strategies for API responses

---

## Recent Updates

- **Clean Sign-In Form**: A professional, responsive sign-in form has been implemented with:
  - Modern UI design with gradient backgrounds
  - Password visibility toggle
  - Feature highlights panel
  - Improved error messaging
  - Responsive layout for all device sizes
  - Loading indicators
  - Enhanced security features

This completes the comprehensive setup guide for AGHAMazingQuestCMS. The system is now ready for development, testing, and production deployment.