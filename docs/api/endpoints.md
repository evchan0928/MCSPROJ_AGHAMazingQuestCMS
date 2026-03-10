# AGHAMazingQuestCMS API Documentation

## Authentication
All API endpoints require authentication using JWT tokens.

## Available Endpoints

### Content Management
- GET /api/content/ - List all content items
- POST /api/content/ - Create new content item
- GET /api/content/{id}/ - Retrieve specific content item
- PUT /api/content/{id}/ - Update specific content item
- DELETE /api/content/{id}/ - Delete specific content item

### User Management
- GET /api/users/ - List all users
- POST /api/users/ - Create new user
- GET /api/users/{id}/ - Retrieve specific user
- PUT /api/users/{id}/ - Update specific user
- DELETE /api/users/{id}/ - Delete specific user

### Analytics
- GET /api/analytics/ - Get analytics data
- POST /api/analytics/download/ - Download analytics report

## Mobile Integration
- GET /api/mobile/ar-content/ - Get AR content for mobile
- GET /api/mobile/chatbot/ - Chatbot integration endpoints
