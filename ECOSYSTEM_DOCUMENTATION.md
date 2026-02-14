# AGHAMazing Quest CMS - Full Ecosystem Documentation

## Overview
This document provides comprehensive documentation for the integrated AGHAMazing Quest CMS ecosystem, consisting of a Django backend CMS and a Flutter mobile application.

## System Architecture

### Backend (Django CMS)
- **Framework**: Django 6.0.2 with Django REST Framework
- **Authentication**: JWT-based authentication
- **Database**: SQLite (default) or PostgreSQL
- **API**: RESTful API endpoints
- **CORS**: Cross-origin resource sharing enabled for Flutter app

### Frontend (Flutter Mobile App)
- **Framework**: Flutter with Dart
- **Architecture**: Service-oriented with API clients
- **Authentication**: Integrated with Django backend
- **Features**: Content consumption, games, AR scanning

## Installation & Setup

### Prerequisites
- Python 3.11+
- Flutter SDK
- Node.js and npm
- Docker and Docker Compose
- Git

### Automated Setup
We've created a comprehensive setup script:

```bash
./setup_ecosystem.sh
```

This script:
1. Verifies all required tools are installed
2. Sets up the Python virtual environment
3. Installs all Python dependencies
4. Runs Django migrations
5. Validates the Django configuration
6. Installs Flutter dependencies
7. Creates necessary environment files

### Manual Setup (Alternative)
If you prefer manual setup:

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Optional: create admin account
```

#### Frontend Setup
```bash
cd aghamazingflutter-master
flutter pub get
```

## Starting the Ecosystem

### Automated Start
Use the provided startup script:

```bash
./start_ecosystem.sh
```

### Manual Start
#### Backend
```bash
cd backend
source venv/bin/activate
python manage.py runserver 8000
```

#### Frontend
```bash
cd aghamazingflutter-master
flutter run
```

## Key Integration Points

### API Endpoints
The Flutter app connects to the Django backend through these endpoints:

- Authentication:
  - `POST /api/auth/login/` - User login
  - `POST /api/auth/register/` - User registration
  - `GET /api/auth/me/` - Get current user profile

- Content Management:
  - `GET /api/content/game/content/` - Get published content
  - `GET /api/content/game/public-content/` - Get public content
  - `GET /api/content/ar-markers/` - Get AR markers

### Data Flow
1. User authenticates via Flutter app to Django backend
2. JWT token is stored in Flutter app for subsequent requests
3. Content is fetched from Django CMS and displayed in Flutter app
4. User progress and actions are synchronized back to Django backend

## Configuration

### Environment Variables
The system uses environment variables for configuration:

#### Backend (.env file)
```
DEBUG=True
DJANGO_SECRET_KEY=your-super-secret-key-change-this-in-production
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
ALLOWED_HOSTS=localhost,127.0.0.1,[::1]
```

### CORS Configuration
The backend is configured to allow requests from the Flutter app:
- Added localhost:8000 to allowed origins for mobile app access
- Properly configured CORS headers and methods

## Development Tools & Extensions

The following VSCode extensions have been installed for optimal development experience:

- Dart & Flutter extensions (official)
- Python extensions with formatters (black, flake8, pylint, isort)
- YAML and XML support
- Docker integration
- Git enhancements (GitLens, Git History)
- Tailwind CSS support
- PHP tools (for potential integrations)
- Markdown linting

## Testing the Integration

### Backend API Test
Verify the backend is responding correctly:
```bash
curl -X GET http://localhost:8000/api/
```

### Authentication Flow Test
1. Register a new user via the Flutter app
2. Verify the user is created in Django admin panel
3. Log in with the new credentials
4. Verify JWT token is properly handled

### Content Management Test
1. Create content items in Django admin panel
2. Set content status to "Published"
3. Verify content appears in the Flutter app's Content Screen

## Troubleshooting

### Common Issues

#### 1. Connection Issues
- Ensure both backend and Flutter app are running
- Check firewall settings
- Verify CORS configuration in Django settings

#### 2. Authentication Issues
- Ensure JWT tokens are properly stored and transmitted
- Check that the token is included in authorization headers for protected endpoints

#### 3. Content Not Loading
- Verify content items are marked as published in the Django admin
- Check that the user has proper permissions to view content

#### 4. Migration Issues
If encountering migration conflicts:
```bash
cd backend
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
```

### Debugging Commands
- Check Django configuration: `python manage.py check`
- Run Django tests: `python manage.py test`
- Validate Flutter code: `flutter analyze`
- Check pub dependencies: `flutter pub get`

## Security Considerations

1. Never expose secret keys in client-side code
2. Use HTTPS in production
3. Validate and sanitize all inputs
4. Implement proper rate limiting
5. Secure file uploads and downloads
6. Regular dependency updates

## Deployment Notes

For production deployment:
1. Set `DEBUG=False`
2. Use proper environment variables for secrets
3. Configure a reverse proxy (like Nginx)
4. Set up a production-ready database
5. Implement proper logging and monitoring
6. Use Gunicorn instead of Django's development server

## Maintenance

### Updating Dependencies
- Backend: Update `requirements.txt` and reinstall
- Frontend: Update `pubspec.yaml` and run `flutter pub get`

### Backup Strategy
- Regular database backups
- Version control for code
- Environment configuration management

## Performance Optimization

### Backend Optimizations
- Database query optimization
- Caching strategies
- Static file optimization with WhiteNoise
- API response compression

### Frontend Optimizations
- Asset compression
- Efficient state management
- Lazy loading of content
- Memory management

## Conclusion

The AGHAMazing Quest CMS ecosystem is now fully integrated with:
- Seamless communication between Flutter frontend and Django backend
- Unified authentication system
- Content management workflow
- Proper error handling and user feedback
- Scalable architecture for future enhancements

The system is ready for development, testing, and eventual deployment.