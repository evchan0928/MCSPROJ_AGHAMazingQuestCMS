# AGHAMazingQuestCMS Architecture

## Overview
The AGHAMazingQuestCMS is a full-stack content management system built with Django (backend) and React (frontend).

## Components

### Backend (Django)
- Built with Django and Django REST Framework
- PostgreSQL database
- Custom Django apps:
  - contentmanagement: Handles content creation and management
  - usermanagement: Manages users and roles
  - mobilemanagement: Integrations for mobile applications
  - analyticsmanagement: Analytics tracking and reporting

### Frontend (React)
- Built with React and JSX
- Connects to Django backend via REST APIs
- Responsive design for multiple device sizes

### Infrastructure
- Docker containers for all services
- Nginx as reverse proxy
- PostgreSQL database
- Portainer for container management
- pgAdmin for database management

## Data Flow
1. User interacts with React frontend
2. Frontend makes API calls to Django backend
3. Backend processes requests and accesses database
4. Response sent back to frontend for display
