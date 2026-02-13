# System Access Guide - DEPRECATED

⚠️ **NOTICE**: This guide is deprecated. Please use the new comprehensive setup guide instead.

## New Setup Guide

For the official and up-to-date development setup and access instructions, please refer to: [DEVELOPMENT_SETUP_GUIDE.md](DEVELOPMENT_SETUP_GUIDE.md)

This new guide contains:
- Complete setup instructions for local development
- Access information for all services
- Troubleshooting tips
- Single authoritative source for setup procedures

## Why This Guide Is Deprecated

We consolidated all setup instructions into a single, comprehensive guide to prevent confusion and ensure all developers follow the same proven process.

## Action Required

Please use [DEVELOPMENT_SETUP_GUIDE.md](DEVELOPMENT_SETUP_GUIDE.md) for all development setup and system access procedures. This file will be removed in a future update.

## Service Access Information

### 1. PostgreSQL Database
- **Container Name:** `agha-postgres`
- **Port:** 5433 (mapped from 5432)
- **Credentials:**
  - Database: `aghamazing_db`
  - User: `admin`
  - Password: `password123`

### 2. pgAdmin Interface
- **URL:** http://localhost:5050
- **Login Credentials:**
  - Email: `aghamazingdost@gmail.com`
  - Password: `DOSTAGHAMazingQuestAdmin1234`
- **Database Connection:** Automatically configured to connect to the PostgreSQL instance

### 3. Django Backend API
- **Direct Access:** http://localhost:8000
- **Through Proxy:** http://localhost:8080
- **API Endpoints:**
  - Login: `POST /api/auth/login/`
  - Content: `GET /api/content/items/`
  - Users: `GET /api/users/`
  - Admin Panel: `/admin/`

### 4. Nginx Reverse Proxy
- **Port:** 8080
- **Purpose:** Unified access to all API endpoints and admin panel
- **Configuration:** Load balancing and routing to backend services

## Available Demo Users

After running `populate_sample_data`, the following demo users are available:

| Role | Username | Password |
|------|----------|----------|
| Demo User | `demo_user` | `demopass123` |
| Encoder | `encoder_user` | `demopass123` |
| Editor | `editor_user` | `demopass123` |
| Approver | `approver_user` | `demopass123` |
| Admin | `admin_user` | `demopass123` |
| Super Admin | `superadmin` | `demopass123` |

## Accessing the System

### 1. Using the API
To access protected endpoints:

1. Get authentication tokens:
```bash
curl -X POST http://localhost:8080/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"encoder_user","password":"demopass123"}'
```

2. Use the access token for subsequent requests:
```bash
ACCESS_TOKEN="your_access_token_from_step_1"
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:8080/api/content/items/
```

### 2. Accessing Admin Panel
- Navigate to: http://localhost:8080/admin/
- Login with any admin user credentials from the table above
- **Note:** Fixed CSRF verification issue by adding `http://localhost:8080` to `CSRF_TRUSTED_ORIGINS` in Django settings

### 3. Managing Database via pgAdmin
- Navigate to: http://localhost:5050
- Login with pgAdmin credentials
- The PostgreSQL database should be auto-configured in the dashboard

## System Status Check

To verify all services are running:

```bash
docker ps | grep agha-
```

You should see these containers:
- `agha-nginx`
- `agha-backend`
- `agha-pgadmin4`
- `agha-postgres`

## Troubleshooting

### Common Issues:

1. **API Returns 405 Method Not Allowed**
   - This is expected for endpoints that require specific HTTP methods
   - Verify you're using the correct HTTP method (GET, POST, PUT, DELETE)

2. **Authentication Fails**
   - Ensure you're using the correct username/password combination
   - Check that you're sending JSON in the correct format
   - Verify the tokens haven't expired (default 15 min access token)

3. **CSRF Verification Failed**
   - This occurs when Django doesn't recognize the origin of the request
   - Solved by adding `http://localhost:8080` and `https://localhost:8080` to `CSRF_TRUSTED_ORIGINS`
   - If the issue persists, restart the backend container: `docker restart agha-backend`

4. **Database Connection Issues**
   - Confirm PostgreSQL container is running
   - Check environment variables are correctly set
   - Verify network connectivity between containers

### Resetting the System:

If you need to reset the system completely:

1. Stop all services:
   ```bash
   /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/stop_full_stack.sh
   ```

2. Start all services:
   ```bash
   /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/start_full_stack.sh
   ```

3. Run migrations and populate data:
   ```bash
   docker exec -it agha-backend python manage.py migrate
   docker exec -it agha-backend python manage.py populate_sample_data
   ```

## Maintenance Commands

- **Check migration status:** `docker exec -it agha-backend python manage.py showmigrations`
- **Run new migrations:** `docker exec -it agha-backend python manage.py migrate`
- **Add sample data:** `docker exec -it agha-backend python manage.py populate_sample_data`
- **Create superuser:** `docker exec -it agha-backend python manage.py createsuperuser`
- **Restart backend after settings changes:** `docker restart agha-backend`

## Security Notes

- Default passwords should be changed in production
- API endpoints are protected with JWT authentication
- CORS is configured to restrict cross-origin requests
- Database connections are containerized and isolated
- CSRF protection is properly configured for the nginx proxy

---

**System verified and operational as of February 13, 2026**