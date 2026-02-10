# Django-PostgreSQL-Flutter Architecture Documentation

## Overview
This document describes how the Django backend with PostgreSQL database connects with a Flutter mobile application using REST APIs.

## Architecture Components

### 1. PostgreSQL Database Layer
- The application uses PostgreSQL as the primary database
- All data models are defined using Django's ORM which maps to PostgreSQL tables
- Database is hosted on Tailscale network at 100.93.255.84:5433 for secure remote access
- All data is managed directly through Django models and APIs

### 2. Django Backend API Layer
- Built using Django and Django REST Framework
- Exposes RESTful endpoints for mobile consumption
- Handles authentication, permissions, and business logic
- Current API endpoints:
  - `/api/auth/` - Authentication endpoints
  - `/api/content/` - Content management endpoints  
  - `/api/users/` - User management endpoints (with roles functionality)
  - `/api/analytics/` - Analytics endpoints

### 3. Flutter Mobile Application Layer
- Consumes the Django REST APIs using HTTP requests
- Can use packages like `http`, `dio`, or `chopper` for API communication
- Optionally, can connect directly to Supabase for real-time features and direct database access (using Row Level Security)
- Handles UI rendering and user interactions
- Manages local state and caching

## How the Connection Works

### Django Backend API Connection
1. Flutter app makes HTTP requests to Django API endpoints (e.g., GET `/api/users/`)
2. Django receives the request, authenticates the user, and processes the request
3. Django ORM queries the PostgreSQL database via Tailscale connection
4. Results are serialized to JSON and returned to the Flutter app
5. Flutter app receives the JSON response and updates the UI accordingly

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


      .select();

    return response;
  }



## Deployment Considerations

### Backend Deployment
- Deploy Django application to platforms like Docker/Portainer
- Connect to PostgreSQL database via Tailscale at 100.93.255.84:5433
- Ensure SSL is configured for Tailscale secure communication

### Mobile App Distribution
- Package Flutter app for iOS and Android
- Submit to Apple App Store and Google Play Store
- Ensure backend endpoints are accessible from mobile networks via Tailscale

## Security Measures
- Use HTTPS for all API communications
- Implement proper authentication and authorization with JWT tokens
- Sanitize all inputs to prevent injection attacks
- Implement rate limiting to prevent abuse
- Store sensitive data securely on the mobile device
- Use Tailscale for secure network access

## Testing the Connection
You can test the API endpoints using tools like Postman or curl:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     http://100.93.255.84:8000/api/users/
```

## Conclusion
This architecture provides a robust, scalable solution for connecting a Flutter mobile application to a PostgreSQL database via a Django REST API. The separation of concerns and Tailscale network integration allows for secure remote access while providing consistent API interfaces for data exchange.
