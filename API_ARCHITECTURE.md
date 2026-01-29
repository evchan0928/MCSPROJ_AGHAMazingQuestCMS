# Django-PostgreSQL-Flutter Architecture Documentation

## Overview
This document describes how the Django backend with PostgreSQL database connects with a Flutter mobile application using REST APIs.

## Architecture Components

### 1. PostgreSQL Database Layer
- The application currently uses PostgreSQL as the primary database when configured with `DB_ENGINE=postgres`
- All data models are defined using Django's ORM which maps to PostgreSQL tables
- The database can be hosted locally or on cloud services like AWS RDS, Google Cloud SQL, or Heroku
- **NEW: Supabase integration** - The application can also connect to a Supabase PostgreSQL database, which provides additional real-time capabilities and authentication services

### 2. Django Backend API Layer
- Built using Django and Django REST Framework
- Exposes RESTful endpoints for mobile consumption
- Handles authentication, permissions, and business logic
- Current API endpoints:
  - `/api/auth/` - Authentication endpoints
  - `/api/content/` - Content management endpoints  
  - `/api/users/` - User management endpoints (with roles functionality)
  - `/api/analytics/` - Analytics endpoints

### 3. Supabase Integration
- Supabase provides a PostgreSQL database with additional features like real-time subscriptions, authentication, and storage
- The application can connect to Supabase using environment variables:
  - `SUPABASE_DB_URL` - Full database connection URL
  - `SUPABASE_ANON_KEY` - Anonymous key for client-side access
  - `SUPABASE_SERVICE_ROLE_KEY` - Service role key for server-side access
  - `SUPABASE_URL` - URL of the Supabase project
- Configuration is located in `config/settings/supabase.py`

### 4. Flutter Mobile Application Layer
- Consumes the Django REST APIs using HTTP requests
- Can use packages like `http`, `dio`, or `chopper` for API communication
- Optionally, can connect directly to Supabase for real-time features and direct database access (using Row Level Security)
- Handles UI rendering and user interactions
- Manages local state and caching

## How the Connection Works

### Option A: Django Backend as Primary API
1. Flutter app makes HTTP requests to Django API endpoints (e.g., GET `/api/users/`)
2. Django receives the request, authenticates the user, and processes the request
3. Django ORM queries the PostgreSQL database (either standalone or Supabase)
4. Results are serialized to JSON and returned to the Flutter app
5. Flutter app receives the JSON response and updates the UI accordingly

### Option B: Direct Supabase Access (Advanced)
1. Flutter app can connect directly to Supabase using the Supabase Flutter client
2. Uses Row Level Security (RLS) policies to control data access
3. Provides real-time subscription capabilities
4. Requires additional security considerations and RLS policies setup

## Configuration Requirements

### For PostgreSQL Connection
```bash
# Environment variables for PostgreSQL
export DB_ENGINE=postgres
export DB_NAME=your_database_name
export DB_USER=your_db_username
export DB_PASSWORD=your_db_password
export DB_HOST=your_postgres_host
export DB_PORT=5432
```

### For Supabase Connection
```bash
# Environment variables for Supabase
export SUPABASE_DB_URL="postgresql://user:password@host:port/dbname?sslmode=require"
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export DB_ENGINE=postgres  # Ensures PostgreSQL backend is used
```

### For API Access
- The Django backend must be deployed and accessible via HTTP/HTTPS
- CORS headers are configured to allow requests from the Flutter app
- Proper authentication mechanisms (JWT, session, or Supabase Auth) must be implemented

## Example API Consumption in Flutter

### Via Django Backend
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiClient {
  static const String baseUrl = 'https://your-django-backend.com/api';
  String? authToken;

  Future<Map<String, String>> getHeaders() async {
    Map<String, String> headers = {
      'Content-Type': 'application/json',
    };
    
    if (authToken != null) {
      headers['Authorization'] = 'Bearer $authToken';
    }
    
    return headers;
  }

  Future<List<User>> getUsers() async {
    final response = await http.get(
      Uri.parse('$baseUrl/users/'),
      headers: await getHeaders(),
    );

    if (response.statusCode == 200) {
      List<dynamic> body = json.decode(response.body);
      return body.map((dynamic item) => User.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load users');
    }
  }

  Future<void> createUser(User user) async {
    final response = await http.post(
      Uri.parse('$baseUrl/users/'),
      headers: await getHeaders(),
      body: jsonEncode(user.toJson()),
    );

    if (response.statusCode != 201) {
      throw Exception('Failed to create user');
    }
  }
}
```

### Via Direct Supabase Access
```dart
import 'package:supabase_flutter/supabase_flutter';

class SupabaseService {
  late SupabaseClient supabase;

  void initialize() {
    supabase = SupabaseClient(
      'https://your-project.supabase.co',
      'your-anon-key',
    );
  }

  Future<List<Map<String, dynamic>>> getUsers() async {
    final response = await supabase
      .from('auth.users') // or your custom table
      .select();

    return response;
  }

  Stream<List<Map<String, dynamic>>> streamUsers() {
    return supabase
      .from('users')
      .stream(['id'])
      .order('created_at');
  }
}
```

## Deployment Considerations

### Backend Deployment
- Deploy Django application to platforms like Heroku, AWS, GCP, or DigitalOcean
- Connect to either a standalone PostgreSQL instance or a Supabase project
- Ensure SSL certificates are configured for secure communication

### Mobile App Distribution
- Package Flutter app for iOS and Android
- Submit to Apple App Store and Google Play Store
- Ensure backend endpoints are accessible from mobile networks

## Security Measures
- Use HTTPS for all API communications
- Implement proper authentication and authorization
- When using direct Supabase access, implement Row Level Security (RLS) policies
- Sanitize all inputs to prevent injection attacks
- Implement rate limiting to prevent abuse
- Store sensitive data securely on the mobile device

## Testing the Connection
You can test the API endpoints using tools like Postman or curl before integrating with Flutter:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     https://your-django-backend.com/api/users/
```

Or test Supabase connection directly:
```bash
curl -H "apikey: YOUR_SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN" \
     https://your-project.supabase.co/rest/v1/users
```

## Conclusion
This architecture provides a robust, scalable solution for connecting a Flutter mobile application to a PostgreSQL database. With the addition of Supabase integration, the application can leverage advanced features like real-time subscriptions and direct database access with proper security measures. The separation of concerns allows for flexible deployment options while providing consistent API interfaces for data exchange.