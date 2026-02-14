# AGHAMazing Quest CMS - Flutter-Django Integration

## Overview
This document outlines the integration between the AGHAMazing Flutter mobile app and the Django CMS backend. The integration enables the mobile app to communicate with the Django backend for user authentication, content management, and other features.

## Integration Summary

### 1. Authentication Flow
- The Flutter app now connects to the Django authentication system instead of relying solely on Firebase
- Updated `AuthService` to handle Django backend authentication
- Login and registration screens updated to use Django endpoints

### 2. API Endpoints Used
- Authentication: `http://localhost:8000/api/auth/`
  - Login: `/api/auth/login/`
  - Register: `/api/auth/register/`
  - User Profile: `/api/auth/me/`
- Content Management: `http://localhost:8000/api/content/`
  - Published Content: `/api/content/game/content/`
  - Public Content: `/api/content/game/public-content/`
  - AR Markers: `/api/content/ar-markers/`

### 3. Key Files Modified/Added
- `lib/services/api_client.dart` - Updated to point to Django backend
- `lib/services/auth_service.dart` - Updated to use Django authentication
- `lib/services/content_api.dart` - New service for content management
- `lib/services/content_manager.dart` - Service to manage content interactions
- `lib/services/userprofile_service.dart` - Service to manage user profiles
- `lib/screens/login_screen.dart` - Updated to use Django backend
- `lib/screens/register_screen.dart` - Updated to use Django backend
- `lib/screens/content_screen.dart` - New screen to display content
- `lib/main.dart` - Added content screen route

## Running the Integrated System

### Prerequisites
- Ensure the Django backend is running on `http://localhost:8000`
- Make sure you have Python, Django, and required packages installed
- Have Flutter SDK installed

### Steps to Run

1. Start the Django backend:
```bash
cd backend
python manage.py runserver
```

2. In a separate terminal, start the Flutter app:
```bash
cd aghamazingflutter-master
flutter pub get
flutter run
```

### Features Available

1. **User Authentication**
   - Register new users via Django backend
   - Login with Django authentication
   - User profile management

2. **Content Management**
   - View published content from Django CMS
   - Access AR markers for AR experiences
   - View public content

3. **Game Features**
   - Continue using existing game features
   - Integrate with CMS content

## Technical Details

### API Client Configuration
The Flutter app now uses the Django backend API endpoints instead of the temporary ngrok URLs. The configuration can be found in `lib/services/api_client.dart`.

### Content API Service
The `ContentApi` service handles communication with the Django content management endpoints, providing methods to fetch published content, public content, and AR markers.

### Migration Path
- Legacy Firebase authentication methods are marked as deprecated but still functional
- New Django-based methods are the primary authentication path
- Transition from Firebase to Django can be gradual

## Troubleshooting

1. **Connection Issues**: Ensure the Django backend is running on `http://localhost:8000`
2. **Authentication Problems**: Verify that user accounts exist in the Django admin panel
3. **Content Not Loading**: Check that content items are published in the Django CMS

## Future Enhancements

1. Add push notification integration
2. Implement offline content caching
3. Add content creation capabilities from the mobile app
4. Enhance the UI for content browsing