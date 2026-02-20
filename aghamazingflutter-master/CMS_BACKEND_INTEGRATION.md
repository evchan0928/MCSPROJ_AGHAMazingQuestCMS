# AGHAMazing Flutter App - CMS Backend Integration Guide

This document describes how the AGHAMazing Flutter application connects to the AGHAMazingQuestCMS backend and PostgreSQL database via RESTful APIs.

## Overview

The AGHAMazing Flutter application communicates with the AGHAMazingQuestCMS backend through a series of RESTful API endpoints. All data operations flow through the Django CMS backend, which manages the PostgreSQL database and provides secure access to content and user data.

## Architecture

```
Flutter App (Mobile) 
    ↓ (REST API calls)
Django CMS Backend 
    ↓ (Database operations)
PostgreSQL Database
```

## API Configuration

The application uses a configurable environment system located in `lib/config/api_config.dart`:

- **Development**: `http://localhost:8001`
- **Staging**: `https://staging-aghamazingquestcms.example.com` (to be configured)
- **Production**: `https://api.aghamazingquestcms.example.com` (to be configured)

The configuration allows seamless switching between different environments without code changes.

## API Endpoints

### Authentication Endpoints
- Register: `/api/auth/register/`
- Login: `/api/auth/login/`
- User Info: `/api/auth/me/`
- OTP Request: `/api/auth/otp/request/`
- OTP Verify: `/api/auth/otp/verify/`
- Password Reset: `/api/auth/password/reset/`

### Content Endpoints
- Game Content: `/api/content/game/content/`
- Public Content: `/api/content/game/public-content/`
- AR Markers: `/api/content/ar-markers/`

### Mobile Management Endpoints
- User Profiles: `/api/mobile/userprofiles/`
- User Sessions: `/api/mobile/usersessions/`
- Scores: `/api/mobile/scores/`
- Badges: `/api/mobile/badges/`
- Leaderboards: `/api/mobile/leaderboards/`

## Database Integration

The Flutter app does not directly connect to the PostgreSQL database. Instead, all database operations are handled by the Django CMS backend through RESTful API calls. This architecture ensures:

1. **Security**: Database credentials and structure are protected
2. **Consistency**: Data validation and business logic are enforced server-side
3. **Maintainability**: Changes to database schema only require backend updates
4. **Scalability**: Backend can handle caching and optimization

## Service Architecture

### API Client (`lib/services/api_client.dart`)
- Centralized API configuration
- Shared instances for authentication and content APIs
- Handles HTTP requests with timeout and error handling

### Authentication Service (`lib/services/auth_service.dart`)
- Manages user authentication state
- Stores and retrieves authentication tokens
- Provides authentication status to the UI

### Content API (`lib/services/content_api.dart`)
- Fetches content from the CMS backend
- Handles AR marker data
- Manages content caching for offline access

### User Profile Service (`lib/services/userprofile_service.dart`)
- Manages user profile data locally
- Syncs with backend profile information
- Uses Firebase and SharedPreferences for local storage

## Environment Configuration

### Switching Between Environments

To switch between development, staging, and production environments:

1. Modify `lib/config/api_config.dart`
2. Change the `currentEnvironment` constant
3. Rebuild the application

```dart
static const String currentEnvironment = 'development'; // Options: 'development', 'staging', 'production'
```

### Windows Development Setup

See `WINDOWS_DEVELOPMENT_SETUP.md` for detailed instructions on setting up the development environment on Windows.

## Testing Backend Connection

To verify that the Flutter app can connect to the CMS backend:

1. Start the Django backend:
   ```bash
   cd backend
   python manage.py runserver 8001
   ```

2. Check API endpoints:
   - http://localhost:8001/api/auth/register/
   - http://localhost:8001/api/auth/login/
   - http://localhost:8001/api/content/game/content/
   - http://localhost:8001/api/swagger/ (for API documentation)

3. Run the Flutter app to connect to these endpoints.

## Security Considerations

1. **HTTPS in Production**: While development allows HTTP connections, production should use HTTPS
2. **Token Management**: Authentication tokens are securely stored and managed
3. **Certificate Validation**: In release builds, certificate validation is enforced
4. **Input Sanitization**: All data sent to the backend is validated by the Django CMS

## Troubleshooting

### Common Issues:

1. **Connection Failures**: Ensure the backend server is running and accessible
2. **CORS Errors**: Backend CORS settings should allow connections from the mobile app
3. **Timeout Issues**: Network conditions may require adjusting timeout values in the API configuration
4. **Authentication Problems**: Verify token validity and authentication endpoints

### Debugging Tips:

1. Check the console output for API configuration info
2. Verify network connectivity between devices
3. Confirm backend server status and logs
4. Use the API documentation at `/api/swagger/` to verify endpoints

## Next Steps

1. Deploy the backend to a staging environment
2. Test with real content from the CMS
3. Optimize for performance and offline capabilities
4. Implement additional error handling and retry mechanisms