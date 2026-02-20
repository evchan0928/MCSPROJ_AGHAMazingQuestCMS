# AGHAMazingQuestCMS

Welcome to the AGHAMazing Quest Content Management System (CMS). This system was developed for the Philippine Department of Science and Technology - Science Education Institute (DOST-SEI) to manage augmented reality (AR) guided tour content for the AGHAMazing Quest project.

## Overview

The AGHAMazingQuestCMS is a full-stack web application featuring:
- A React-based frontend for content management
- A Django REST API backend for data handling
- Role-based access control for content creators, approvers, and administrators
- Integration with the companion mobile AR application

## Tech Stack

- **Frontend**: React 18, Ant Design, Axios
- **Backend**: Django 4+, Django REST Framework
- **Database**: PostgreSQL
- **Mobile App**: Flutter (separate integration)

## Development Setup

For a complete development environment setup, please refer to our comprehensive guide:

[Full Stack Development Setup Guide](FULL_STACK_DEVELOPMENT_SETUP.md)

For daily development quick start, see:

[Quick Start Guide](QUICK_START_GUIDE.md)

## Scripts

We provide an automated setup script to simplify the initial environment configuration:

- [setup_full_stack.sh](setup_full_stack.sh): Automated setup script for the full-stack development environment

## Architecture

The system consists of three main components:

### Backend (Django)
Located in the `backend/` directory, this component provides:
- RESTful API endpoints
- User authentication and authorization
- Content management workflows
- Role-based access control
- Database models and migrations

### Frontend (React)
Located in the `frontend/` directory, this component provides:
- Dashboard interface for content management
- User role management
- Content upload and editing
- Analytics and reporting
- Mobile management features

### Mobile (Flutter)
Located in the `aghamazingflutter-master/` directory, this component provides:
- Mobile access to content
- User profiles and authentication
- Game mechanics and scoring
- Offline content access

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd MCSPROJ_AGHAMazingQuestCMS
   ```

2. Set up the backend:
   - Navigate to `backend/` directory
   - Create a Python virtual environment
   - Install dependencies from `requirements.txt`
   - Set up the database
   - Run migrations
   - Start the server

3. Set up the frontend:
   - Navigate to `frontend/` directory
   - Install dependencies with `npm install`
   - Configure environment variables
   - Start the development server

4. For detailed instructions, refer to the setup guides mentioned above.

## Project Structure

```
MCSPROJ_AGHAMazingQuestCMS/
├── backend/                 # Django REST API backend
│   ├── apps/               # Custom Django apps
│   │   ├── authentication/
│   │   ├── contentmanagement/
│   │   ├── usermanagement/
│   │   └── analyticsmanagement/
│   └── ...
├── frontend/               # React frontend application
│   ├── src/
│   ├── package.json
│   └── ...
├── aghamazingflutter-master/  # Flutter mobile application
└── ...
```

## API Documentation

API documentation is available via Swagger when the backend is running at `/api/swagger/`.

## Contributing

Please read the [Full Stack Development Setup Guide](FULL_STACK_DEVELOPMENT_SETUP.md) before contributing to ensure your development environment is properly configured.

## License

This project is developed for DOST-SEI. For licensing information, please contact the project maintainers.