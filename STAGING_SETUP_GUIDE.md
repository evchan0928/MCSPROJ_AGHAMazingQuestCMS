# Staging Environment Setup Guide

This document describes how to set up and run the application in a staging environment.

## Environment Configuration

The staging environment is configured using environment variables in the `.env` file:

```bash
# Database configuration
DB_ENGINE=postgres
DB_NAME=aghamazing_db
DB_USER=postgres
DB_PASSWORD=admin123
DB_HOST=localhost
DB_PORT=5433

# Django settings
DJANGO_SECRET_KEY=django-insecure-staging-key-for-development-and-testing-purpose-only
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,[::1],172.19.91.23

# Staging-specific settings
STAGING_ENVIRONMENT=True
DJANGO_SECURE_SSL_REDIRECT=False
DJANGO_SESSION_COOKIE_SECURE=False
DJANGO_CSRF_COOKIE_SECURE=False
```

## Running the Application in Staging Mode

### Backend (Django/Wagtail)

Start the Django server to listen on all network interfaces:

```bash
cd /path/to/AGHAMazingQuestCMS
python manage.py runserver 0.0.0.0:8080
```

Access the staging backend at:
- Main application: `http://<your-ip>:8080/`
- Admin panel: `http://<your-ip>:8080/admin/`
- API endpoints: `http://<your-ip>:8080/api/`

### Frontend (React)

Start the React development server:

```bash
cd /path/to/AGHAMazingQuestCMS/frontend
npm start
```

The frontend will be available at `http://<your-ip>:3000/`.

## Staging-Specific Characteristics

1. **Security Settings**:
   - SSL redirects disabled
   - Secure cookies disabled (for HTTP development)
   - Debug mode enabled
   - Relaxed HSTS policies

2. **Environment Variables**:
   - `STAGING_ENVIRONMENT=True` flag
   - Less restrictive security settings
   - Debug information available

3. **Network Accessibility**:
   - Backend binds to `0.0.0.0:8080` to accept external connections
   - ALLOWED_HOSTS includes local network IP addresses
   - Frontend and backend communicate via network

## Firewall Configuration

To allow external access to the staging environment:

```bash
sudo ufw allow 8080
sudo ufw allow 3000
```

## Staging vs Production Differences

| Aspect | Staging | Production |
|--------|---------|------------|
| DEBUG setting | True | False |
| SSL redirects | Disabled | Enabled |
| Secure cookies | Disabled | Enabled |
| Allowed hosts | Network IPs allowed | Specific domains only |
| Secret key | Insecure (for dev) | Secure random string |
| Performance | Development mode | Optimized |

## Access from Network

Once the servers are running and firewall rules are set, other devices on the same network can access the application using the host machine's IP address:

- Frontend: `http://<host-ip>:3000/`
- Backend API: `http://<host-ip>:8080/api/`
- Admin: `http://<host-ip>:8080/admin/`

## Important Security Notes

⚠️ **Warning**: This staging configuration is not suitable for production use:
- Debug mode reveals potentially sensitive information
- SSL is not enforced
- Cookie security is disabled
- Network access is permitted

For production deployment, ensure appropriate security settings are enabled.