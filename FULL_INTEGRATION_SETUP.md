# Full Integration Setup Guide: AGHAMazing Flutter App + Django CMS Backend

## Overview
This guide explains how to properly set up and run the integrated system of the AGHAMazing Flutter mobile app with the Django CMS backend.

## Prerequisites
- Python 3.11+
- Node.js and npm
- Flutter SDK
- PostgreSQL (recommended) or SQLite
- Git

## Step-by-Step Setup

### 1. Backend Setup (Django CMS)

#### A. Clone and Navigate to Backend
```bash
cd backend
```

#### B. Set Up Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### C. Install Dependencies
```bash
pip install -r requirements.txt
```

#### D. Configure Environment Variables
Create a `.env` file in the backend directory:
```env
DEBUG=True
DJANGO_SECRET_KEY=your-secret-key-here
DB_ENGINE=postgresql
DB_NAME=aghamazing_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

#### E. Run Migrations
```bash
python manage.py migrate
```

#### F. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

#### G. Start Backend Server
```bash
python manage.py runserver
```
The backend will be available at `http://localhost:8000`.

### 2. Frontend Setup (Flutter App)

#### A. Navigate to Flutter Directory
```bash
cd aghamazingflutter-master
```

#### B. Get Dependencies
```bash
flutter pub get
```

#### C. Run the App
```bash
flutter run
```

### 3. API Configuration

The Flutter app is configured to connect to the Django backend at `http://localhost:8000`. If you need to change this:

1. Edit `lib/services/api_client.dart` and update the base URLs:
```dart
final AuthApi authApi = AuthApi(
  registerUrl: 'http://your-backend-url/api/auth/register/',
  loginUrl: 'http://your-backend-url/api/auth/login/',
  // ... other endpoints
);

final ContentApi contentApi = ContentApi(
  baseUrl: 'http://your-backend-url',  // Base URL for Django backend
  // ... other config
);
```

### 4. Testing the Integration

#### A. Verify Backend Endpoints
Once the backend is running, you can test these endpoints:
- `GET http://localhost:8000/api/` - API root
- `POST http://localhost:8000/api/auth/login/` - Login
- `POST http://localhost:8000/api/auth/register/` - Registration
- `GET http://localhost:8000/api/auth/me/` - User profile
- `GET http://localhost:8000/api/content/game/content/` - Published content
- `GET http://localhost:8000/api/content/game/public-content/` - Public content
- `GET http://localhost:8000/api/content/ar-markers/` - AR markers

#### B. Test Authentication Flow
1. Register a new user through the Flutter app
2. Verify the user is created in the Django admin panel
3. Log in with the new credentials
4. Verify JWT token is properly handled

#### C. Test Content Management
1. Create content items in Django admin (`http://localhost:8000/admin/`)
2. Set content status to "Published"
3. Verify content appears in the Flutter app's Content Screen

## Common Issues and Solutions

### 1. Network Errors
- Ensure both backend and Flutter app are running
- Check firewall settings
- Verify CORS configuration in Django settings

### 2. Authentication Issues
- Ensure JWT tokens are properly stored and transmitted
- Check that the token is included in authorization headers for protected endpoints

### 3. Content Not Loading
- Verify content items are marked as published in the Django admin
- Check that the user has proper permissions to view content

### 4. CORS Issues
If experiencing CORS errors, ensure your Django settings include:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:8000',
    # Add other origins as needed
]
CORS_ALLOW_CREDENTIALS = True
```

## Architecture Overview

### Backend (Django CMS)
- Authentication via JWT tokens
- Content management with status workflow (draft → pending review → approved → published)
- RESTful API endpoints for mobile app integration
- Role-based access control

### Frontend (Flutter App)
- Authentication service with Django backend
- Content management service
- User profile management
- Game and educational features

## Security Considerations

1. Never expose secret keys in client-side code
2. Use HTTPS in production
3. Validate and sanitize all inputs
4. Implement proper rate limiting
5. Secure file uploads and downloads

## Deployment Notes

For production deployment:
1. Set `DEBUG=False`
2. Use proper environment variables for secrets
3. Configure a reverse proxy (like Nginx)
4. Set up a production-ready database
5. Implement proper logging and monitoring