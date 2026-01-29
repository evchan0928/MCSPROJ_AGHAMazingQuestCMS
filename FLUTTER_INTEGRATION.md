# Django-PostgreSQL-Flutter Integration Guide

This guide explains how to set up and use the Django-PostgreSQL backend with a Flutter mobile application.

## Architecture Overview

The application consists of:
1. Django/Wagtail backend serving REST APIs
2. PostgreSQL database (either standalone or Supabase)
3. Flutter mobile application consuming the APIs

## Setting Up the Django-PostgreSQL Backend

### 1. Environment Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd MCSPROJ_AGHAMazingQuestCMS

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Configuration

Choose one of the following options:

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL locally, then set environment variables:
export DB_ENGINE=postgres
export DB_NAME=aghamazing_db
export DB_USER=your_pg_username
export DB_PASSWORD=your_pg_password
export DB_HOST=localhost
export DB_PORT=5432
```

#### Option B: Supabase PostgreSQL
```bash
# Sign up at supabase.io and create a new project, then:
export DB_ENGINE=postgres
export SUPABASE_DB_URL="postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require"
export SUPABASE_URL="https://[your-project-ref].supabase.co"
export SUPABASE_ANON_KEY="[your-anon-key]"
export SUPABASE_SERVICE_ROLE_KEY="[your-service-key]"
```

### 3. Run Migrations and Start Server

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create a superuser
python manage.py createsuperuser

# Create content roles
python manage.py create_content_roles

# Start the development server
python manage.py runserver
```

## Creating Flutter Application

### 1. Set up Flutter Project

```bash
flutter create my_agha_app
cd my_agha_app
```

### 2. Add Dependencies

Add these to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^0.14.0
  # Optional: For direct Supabase integration
  supabase_flutter: ^1.0.0
```

### 3. Create API Client

Create a file `lib/services/api_client.dart`:

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';

class ApiClient {
  static const String baseUrl = 'http://10.0.2.2:8000/api'; // Use your actual server IP
  String? _token;

  Future<Map<String, String>> getHeaders({bool requiresAuth = true}) async {
    Map<String, String> headers = {
      'Content-Type': 'application/json',
    };

    if (_token != null && requiresAuth) {
      headers['Authorization'] = 'Bearer $_token';
    }

    return headers;
  }

  Future<bool> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login/'),
        headers: await getHeaders(requiresAuth: false),
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['access'];
        return true;
      }
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  Future<List<dynamic>> getUsers() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users/'),
        headers: await getHeaders(),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load users');
      }
    } catch (e) {
      print('Error getting users: $e');
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getUserRoles() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users/roles/'),
        headers: await getHeaders(),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data);
      } else {
        throw Exception('Failed to load roles');
      }
    } catch (e) {
      print('Error getting roles: $e');
      rethrow;
    }
  }
}
```

### 4. Example Flutter Screen Using the API

Create a file `lib/screens/users_screen.dart`:

```dart
import 'package:flutter/material.dart';
import '../services/api_client.dart';

class UsersScreen extends StatefulWidget {
  @override
  _UsersScreenState createState() => _UsersScreenState();
}

class _UsersScreenState extends State<UsersScreen> {
  final ApiClient _apiClient = ApiClient();
  List<dynamic> _users = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final users = await _apiClient.getUsers();
      setState(() {
        _users = users;
        _isLoading = false;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading users: $e')),
      );
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Users'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _loadUsers,
          )
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _users.length,
              itemBuilder: (context, index) {
                final user = _users[index];
                return ListTile(
                  title: Text(user['username']),
                  subtitle: Text(user['email']),
                  trailing: Text(user['is_active'] ? 'Active' : 'Inactive'),
                );
              },
            ),
    );
  }
}
```

### 5. Running the Integrated Solution

1. Start the Django backend: `python manage.py runserver`
2. In another terminal, run the Flutter app: `flutter run`

## Important Notes

1. **Network Configuration**: When testing on an emulator/device, you'll need to use the host machine's IP address instead of `localhost`. On Android emulators, `10.0.2.2` usually refers to the host machine.

2. **Security**: For production, ensure HTTPS is used for all API communications.

3. **Supabase Integration**: If using direct Supabase access from Flutter, consider implementing Row Level Security (RLS) policies to protect data.

4. **Testing**: You can test the Django API endpoints directly using tools like Postman before connecting with Flutter.

## Troubleshooting

1. **Connection Issues**: Verify that the Django server is running and accessible from the mobile device/emulator
2. **Authentication**: Make sure JWT tokens are properly stored and sent with authenticated requests
3. **CORS**: Check that CORS settings in Django allow requests from your mobile application
4. **Database**: Confirm that database migrations have been run and the database is accessible

This architecture provides a solid foundation for a Flutter mobile application connected to a Django-PostgreSQL backend.