# Frontend Integration Guide

## Overview
This document explains how to ensure the frontend is fully functional and connected to the backend and database for the AGHAMazingQuestCMS application.

## Current Configuration

### Backend Settings
- Backend URL: `http://172.19.91.23:8080/api`
- Allowed hosts include: `172.19.91.23`
- CORS origins include: `http://172.19.91.23:3000` and `http://172.19.91.23:8080`

### Frontend Settings
- Environment variable: `REACT_APP_BACKEND_API_URL=http://172.19.91.23:8080/api`
- Runs on: `http://localhost:3000`

## Running the Full Stack Application

### Option 1: Using the run_both script (Development)
```bash
cd /home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS
chmod +x scripts/run_both.sh
./scripts/run_both.sh
```

### Option 2: Manual startup
1. **Start the backend:**
   ```bash
   cd /home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS
   source venv/bin/activate
   python manage.py runserver 0.0.0.0:8080
   ```

2. **In a new terminal, start the frontend:**
   ```bash
   cd /home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS/frontend
   npm start
   ```

### Option 3: Staging environment
```bash
cd /home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS
chmod +x start_staging.sh
./start_staging.sh
```

## Verifying the Connection

### 1. Test Backend Endpoints
```bash
# Test authentication endpoint
curl -X OPTIONS http://172.19.91.23:8080/api/auth/login/

# Test content endpoint
curl -X OPTIONS http://172.19.91.23:8080/api/content/items/
```

### 2. Check Database Connectivity
```bash
# Verify database connectivity
cd /home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS
python manage.py check_integrity
```

### 3. Frontend Network Tab
After starting the frontend, open browser developer tools and check:
- Network tab for API requests to the backend
- Console for any CORS or connection errors

## Troubleshooting Common Issues

### Issue 1: CORS Errors
If you see CORS errors in the browser console:
1. Verify that your frontend URL is in the `CORS_ALLOWED_ORIGINS` setting
2. Restart the backend server after making changes to settings

### Issue 2: Cannot Connect to Backend
If the frontend reports "Network Error":
1. Check if the backend is running on the correct IP and port
2. Verify firewall settings allow connections on port 8080
3. Confirm the REACT_APP_BACKEND_API_URL matches the backend address

### Issue 3: Authentication Issues
If authentication isn't working:
1. Check that JWT tokens are being stored in localStorage
2. Verify the token refresh mechanism works
3. Ensure the backend has the correct authentication endpoints

## Testing the Integration

### 1. API Tests
Run the following to verify API connectivity:
```bash
# Backend connectivity
curl http://172.19.91.23:8080/api/auth/csrf/

# Database connectivity
echo "SELECT COUNT(*) FROM django_migrations;" | python manage.py dbshell
```

### 2. Frontend Functionality Tests
1. Open the frontend at `http://localhost:3000`
2. Try to access protected routes (should redirect to login)
3. Attempt to login with valid credentials
4. Verify content management features work
5. Test role-based access controls

## Architecture Overview

### Backend Components
- Django REST Framework APIs
- Wagtail CMS integration
- PostgreSQL database connection
- JWT authentication
- Role-based permissions

### Frontend Components
- React application
- Ant Design UI components
- Axios for API calls
- React Router for navigation
- JWT token management

### Database Connection Flow
1. Frontend makes API request to backend
2. Backend authenticates request using JWT
3. Backend queries PostgreSQL database
4. Backend returns JSON response to frontend
5. Frontend renders data to user interface

## Verification Checklist

- [ ] Backend running on `http://0.0.0.0:8080`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Environment variables correctly set
- [ ] CORS configuration allows frontend-backend communication
- [ ] Database connectivity verified
- [ ] Authentication flow works
- [ ] Content management features accessible
- [ ] API calls return expected data
- [ ] Frontend displays data from backend
- [ ] All role-based permissions enforced correctly

## Next Steps

1. Test all major workflows with real data
2. Verify error handling and edge cases
3. Perform performance testing with multiple concurrent users
4. Set up monitoring for production deployment