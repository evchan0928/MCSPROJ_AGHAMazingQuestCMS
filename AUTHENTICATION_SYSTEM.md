# AGHAMazingQuestCMS Authentication System

## Overview

The AGHAMazingQuestCMS application implements a full-stack authentication system using JWT (JSON Web Tokens) for secure communication between the React frontend and Django backend.

## Architecture

### Backend (Django)
- **Framework**: Django REST Framework with SimpleJWT
- **Authentication Method**: JWT tokens (access and refresh tokens)
- **Endpoints**:
  - `POST /api/auth/login/` - Authenticate user and return JWT tokens
  - `POST /api/auth/refresh/` - Refresh expired access token using refresh token
  - `POST /api/auth/logout/` - Logout user (optional server-side invalidation)
  - `GET /api/auth/me/` - Get current authenticated user info

### Frontend (React)
- **Storage**: LocalStorage for JWT tokens
- **API Client**: Axios with interceptors for automatic token management
- **Components**:
  - [SignInScreen.jsx](file:///home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/frontend/src/SignInScreen.jsx) - Main login page
  - [Login.jsx](file:///home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/frontend/src/Login.jsx) - Alternative login page
  - [api/django-api.js](file:///home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/frontend/src/api/django-api.js) - API functions and authentication utilities

## Authentication Flow

1. **User Login**:
   - User enters username/email and password
   - Credentials are sent to `/api/auth/login/` endpoint
   - Backend validates credentials against PostgreSQL database
   - On success, backend returns access and refresh tokens

2. **Token Storage**:
   - Frontend stores tokens in localStorage
   - Access token is used in Authorization header for API requests

3. **Automatic Token Refresh**:
   - When access token expires, interceptor automatically refreshes it
   - Uses refresh token to get new access token from `/api/auth/refresh/`
   - Continues original request with new token

4. **Protected Routes**:
   - All API requests include Authorization header with access token
   - Backend validates token before processing requests

## Key Features

### JWT Token Management
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Automatic refresh when access token expires
- Secure token storage in localStorage

### Security Measures
- CSRF protection with tokens
- CORS configured for safe cross-origin requests
- Password hashing using Django's built-in security
- Permission-based access control

### Error Handling
- Comprehensive error handling for authentication failures
- Clear user feedback for login issues
- Automatic redirection on token expiration

## API Functions

The [api/django-api.js](file:///home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/frontend/src/api/django-api.js) file provides these key authentication functions:

- `signInWithEmail(usernameOrEmail, password)` - Authenticate user
- `signOut()` - Log out user and clear tokens
- `getCurrentUserProfile()` - Get current user info
- `getApiClient()` - Get configured API client instance

## Integration Points

### Frontend Components
- [SignInScreen.jsx](file:///home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/frontend/src/SignInScreen.jsx) uses `signInWithEmail()` for authentication
- [Login.jsx](file:///home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/frontend/src/Login.jsx) also uses `signInWithEmail()` for authentication
- Both components store tokens and redirect to protected routes after login

### Backend Models
- User authentication against Django's built-in User model
- Integration with CustomUserRole for role-based access control
- Connection to PostgreSQL database for user data persistence

## Testing Credentials

For development and testing, you can use the following credentials created by the populate script:

- Username: `admin`, Password: `admin123`
- Username: `demo_user`, Password: (default or set during creation)
- Username: `encoder_user`, Password: (default or set during creation)
- And other users created by the populate script

## Security Considerations

- JWT tokens are stored in localStorage (consider HttpOnly cookies for production)
- All API requests are secured with authentication
- CORS is configured to only allow trusted origins
- Passwords are securely hashed in the database