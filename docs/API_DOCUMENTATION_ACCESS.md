# API Documentation Access Guide

This guide explains how to access the API documentation within the development environment.

## Overview

The AGHAMazingQuestCMS project provides interactive API documentation using Swagger UI, which is accessible when the Django development server is running.

## Accessing the API Documentation

### Prerequisites

- The Django development server must be running
- You must be in the activated virtual environment (`venv`)

### Steps to Access API Documentation

1. **Start the Virtual Environment**
   ```bash
   cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend
   source venv/bin/activate
   ```

2. **Start the Development Server**
   ```bash
   python manage.py runserver
   ```
   
   The server will typically start on `http://127.0.0.1:8000/` or `http://localhost:8000/`, though the port may vary if 8000 is busy.

3. **Access the API Documentation**
   - Open your web browser
   - Navigate to `http://localhost:[PORT]/api/swagger/` (replacing `[PORT]` with the actual port shown in the terminal)
   - You should see the interactive Swagger UI with all available API endpoints

### API Documentation URLs

- **Swagger UI**: `http://localhost:[PORT]/api/swagger/`
- **API Root**: `http://localhost:[PORT]/api/`

Where `[PORT]` is the port number displayed when you start the development server (typically 8000, 8001, etc.).

## Available API Sections

The API documentation includes the following sections:

- **Authentication**: Login, registration, and token management endpoints
- **Content Management**: Endpoints for managing content items
- **User Management**: User-related endpoints
- **Analytics**: Data and statistics endpoints
- **Mobile Management**: Mobile-specific endpoints for the Flutter app

## Troubleshooting

### Previously Fixed Issue: "Failed to load API definition. Fetch error: Internal Server Error"

This issue occurred due to:
- Conflicting UserSerializer definitions in different apps that shared the same ref_name
- ViewSet methods being called during schema generation without proper request context

**Resolution**: 
- Added unique `ref_name` values to each UserSerializer to avoid conflicts
- Implemented proper handling of schema generation in ViewSet get_queryset methods using the `getattr(self, 'swagger_fake_view', False)` check

### Cannot Access the API Documentation

- Verify that the Django development server is running
- Check that you're using the correct port number
- Ensure your firewall is not blocking the connection

### Blank Page or Error

- Try clearing your browser cache
- Verify that you have the required dependencies installed in your virtual environment
- Check the terminal where the server is running for any error messages

## Development Notes

- The API documentation is automatically generated from the code
- Changes to API endpoints will be reflected in the documentation automatically
- The documentation is only available when `DEBUG = True` in the Django settings