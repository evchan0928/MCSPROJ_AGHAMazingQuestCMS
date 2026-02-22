# AGHAMazingQuestCMS Architecture

## Overview

AGHAMazingQuestCMS is a content management system for the AGHAMazing Quest AR-guided tour application, developed for the Department of Science and Technology - Science Education Institute (DOST-SEI) in the Philippines.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Flutter App   │    │     React        │    │   Django REST API   │
│                 │◄──►│     Frontend     │◄──►│                     │
│   (Mobile)      │    │                  │    │  ┌─────────────────┐│
└─────────────────┘    └──────────────────┘    │  │   PostgreSQL    ││
                                                │  │   (Neon)        ││
┌─────────────────┐                            │  └─────────────────┘│
│   Users/Visitors│                            └─────────────────────┘
└─────────────────┘
```

### Technology Stack

- **Backend**: Django 5.2.7 with Django REST Framework
- **Database**: PostgreSQL (with support for Neon Serverless PostgreSQL)
- **Frontend**: React 18+ with Ant Design
- **Mobile**: Flutter with Firebase integration
- **API Documentation**: Swagger/OpenAPI with drf-yasg
- **Authentication**: JWT with SimpleJWT

### Backend Architecture

#### Django Applications

The backend is modularized into several Django applications:

- **`authentication`**: Handles user authentication and authorization
- **`contentmanagement`**: Manages AR content, markers, and related metadata
- **`usermanagement`**: Manages user roles and permissions (RBAC)
- **`analyticsmanagement`**: Tracks content performance and user engagement
- **`mobilemanagement`**: Handles mobile-specific features and integrations

#### Database Layer

The system supports both traditional PostgreSQL and Neon Serverless PostgreSQL:

- Connection managed through environment variables
- SSL mode required for security
- Connection pooling and keep-alive settings for performance
- Migrations handled by Django's migration system

#### API Layer

- RESTful API design using Django REST Framework
- JWT-based authentication
- Rate limiting for API protection
- CORS configured for frontend integration
- Comprehensive API documentation with Swagger

### Frontend Architecture

- Component-based architecture with React
- State management with React hooks
- Integration with Django REST API
- Responsive design for various screen sizes

### Mobile Architecture

- Flutter application for cross-platform mobile experience
- Integration with AR technologies
- Firebase for authentication and data synchronization
- Offline capabilities for limited connectivity situations

## Deployment Architecture

### Development Environment

- Local development with Django development server
- Hot reloading for frontend development
- Separate servers for backend (port 8000) and frontend (port 3000)

### Production Environment

- Containerized deployment with Docker
- Nginx as reverse proxy and static file server
- Gunicorn for WSGI serving
- Environment-specific configurations

## Security Architecture

- JWT-based authentication for stateless security
- Role-based access control (RBAC) for fine-grained permissions
- SSL/TLS for all communications
- Input validation and sanitization
- Protection against common web vulnerabilities (XSS, CSRF, SQL injection)

## Performance Architecture

- Database connection pooling
- API caching strategies
- Optimized database queries
- Static asset optimization
- CDN integration for media files

## Scalability Architecture

- Stateless design for horizontal scaling
- Database read replicas for improved read performance
- Caching layers for frequently accessed data
- Microservice-ready architecture (future extensibility)

## Integration Points

### External Integrations

- **Firebase**: For mobile authentication and data synchronization
- **Google ML Kit**: For text recognition capabilities
- **Tailscale**: For secure remote development access
- **Neon**: For serverless PostgreSQL hosting

### Internal Integrations

- API-first design enabling multiple client types
- Event-driven architecture for system notifications
- Audit logging for compliance and monitoring

## Monitoring and Observability

- Django logging configuration
- API request/response logging
- Performance metrics collection
- Error tracking and alerting