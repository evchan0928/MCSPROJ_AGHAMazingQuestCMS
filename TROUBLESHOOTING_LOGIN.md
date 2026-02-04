# Troubleshooting Login Network Errors

This guide helps resolve network errors when attempting to log in to the AGHAMazingQuestCMS application.

## Common Causes and Solutions

### 1. Backend Server Not Running
**Symptom**: Network Error when trying to log in
**Solution**: 
- Ensure the backend server is running on `http://localhost:8000`
- Start it with: `cd backend && python manage.py runserver`

### 2. Hostname Inconsistency
**Symptom**: CORS error or network error
**Solution**:
- Both frontend and backend must use consistent hostnames
- Frontend should connect to `http://localhost:8000/api` (not `127.0.0.1`)
- Backend should allow requests from `http://localhost:3000`

### 3. CORS Configuration
**Issue**: Fixed in the backend configuration
**Details**: 
- CORS settings updated to allow `http://localhost:3000` and `http://127.0.0.1:3000`
- CSRF trusted origins configured for both frontend and backend domains

### 4. Browser Cache
**Symptom**: Still getting errors after server restart
**Solution**:
- Clear browser cache and cookies
- Try in an incognito/private window
- Restart your browser

## Quick Fix Steps

1. **Stop all running servers**
   - Kill any existing backend/frontend processes

2. **Restart using the provided script**:
   ```bash
   ./restart_full_stack.sh
   ```

3. **Wait for both servers to fully start**
   - Backend on http://localhost:8000
   - Frontend on http://localhost:3000

4. **Try logging in again**

## Verification Steps

1. **Check backend status**:
   - Visit http://localhost:8000/admin/ - should load Django admin
   - Visit http://localhost:8000/api/auth/ - should show API endpoints

2. **Check frontend status**:
   - Visit http://localhost:3000/ - should load login page

3. **Test login**:
   - Use credentials: username `admin`, password `admin123`

## Known Working Credentials

From the populated database, you can use these valid credentials:

### Primary Admin:
- **Username/Email**: `admin`
- **Password**: `admin123`

### Alternative Accounts:
- `demo_user` (password may vary)
- `encoder_user` (password may vary)
- `editor_user` (password may vary)
- `approver_user` (password may vary)
- `admin_user` (password may vary)

## If Problems Persist

1. Verify that ports 8000 and 3000 are not used by other applications
2. Check firewall settings to ensure local connections are allowed
3. Make sure you're using the same hostname consistently (preferably `localhost` for both)
4. Review the backend logs for specific error messages

## Development Mode Specifics

In development mode:
- The backend allows all origins if not explicitly configured otherwise
- Credentials are stored in the PostgreSQL database
- Sessions and tokens are managed via localStorage