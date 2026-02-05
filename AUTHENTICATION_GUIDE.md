# Authentication Guide for AGHAMazingQuestCMS

This guide explains how to properly use the authentication system in the AGHAMazingQuestCMS application.

## Overview

The application uses a JWT-based authentication system with the following components:
- Frontend: React application with token storage in localStorage
- Backend: Django/Wagtail API with JWT authentication
- Reverse Proxy: Nginx serving the complete application

## How Authentication Works

### 1. Login Flow
1. User visits `http://localhost` (the main entry point)
2. User enters valid credentials on the login page
3. Credentials are sent to `/api/auth/login/` endpoint
4. Backend validates credentials and returns JWT tokens
5. Frontend stores `access` and `refresh` tokens in localStorage

### 2. API Requests
1. For protected API requests, the frontend automatically includes the access token in the Authorization header
2. If the access token expires, the frontend attempts to refresh it using the refresh token
3. If token refresh fails, the user is redirected to the login page

### 3. Protected Endpoints
- `/dashboard/*` - All dashboard routes require authentication
- `/api/auth/me/` - Get current user info
- `/api/users/roles/` - Get user roles
- All content management endpoints
- All analytics endpoints

## Common Issues and Solutions

### Issue: "Authentication credentials were not provided"

**Cause:** This occurs when trying to access protected resources without proper authentication.

**Solution:** 
1. Make sure you're accessing the application through `http://localhost` (not localhost:3000 or localhost:8000)
2. Navigate to the login page and authenticate with valid credentials
3. Valid test credentials: `admin` / `admin123`

### Issue: Session expires after 15 minutes

**Cause:** Access tokens have a 15-minute lifetime for security purposes.

**Solution:** The application automatically attempts to refresh the token using the refresh token. If successful, the user continues without interruption. If the refresh token is also expired, the user is redirected to login.

### Issue: Cannot access roles page at `/dashboard/users/roles`

**Solution:** 
1. Ensure you're logged in first
2. Access the application through the nginx proxy at `http://localhost`
3. Navigate to the roles page after successful authentication

## Troubleshooting Steps

1. **Verify the application is running**:
   ```bash
   curl -I http://localhost/
   ```

2. **Test the login endpoint**:
   ```bash
   curl -X POST http://localhost/api/auth/login/ -H "Content-Type: application/json" -d '{"username":"admin", "password":"admin123"}'
   ```

3. **Test a protected endpoint with a valid token**:
   ```bash
   curl -X GET http://localhost/api/auth/me/ -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
   ```

4. **Clear browser storage** if you're having persistent authentication issues:
   - Open browser developer tools (F12)
   - Go to Application/Storage tab
   - Clear localStorage entries for the site

## Security Features

- JWT tokens with limited lifetime (15 minutes for access token, 7 days for refresh token)
- Automatic token refresh mechanism
- Secure redirects to login on authentication failures
- Proper error handling for various authentication scenarios
- CSRF protection for state-changing operations

## Best Practices

1. Always access the application through the nginx proxy (`http://localhost`)
2. Use strong, unique passwords in production
3. Regularly rotate secrets and tokens
4. Monitor authentication logs for suspicious activities
5. Test the authentication flow regularly to ensure it's working correctly