# Aghamazing Quest - Content Management System

A comprehensive content management system for managing educational content with role-based access control, content approval workflows, and multi-platform support.

## Overview

The Aghamazing Quest CMS is a full-stack application designed to manage content creation, approval, and publication workflows. It includes:

- **Backend**: Django REST API with role-based access control
- **Frontend**: React-based dashboard for content management
- **Mobile**: Flutter application for mobile access
- **Database**: PostgreSQL for data storage

## Features

- Role-based access control (Super Admin, Admin, Editor, Encoder, Approver)
- Content management with approval workflows
- User management system
- Mobile application integration
- Analytics and reporting capabilities
- Real-time notifications

## Tech Stack

- **Backend**: Django, Django REST Framework, JWT Authentication
- **Frontend**: React, Ant Design, Axios
- **Mobile**: Flutter, Dart
- **Database**: PostgreSQL
- **Development**: Python 3.12+, Node.js 18+, Flutter 3.16+

## Development Setup

For detailed setup instructions, see:
- [Development Setup Guide](./DEVELOPMENT_SETUP_GUIDE.md)
- [Full Stack Development Setup Guide](./FULL_STACK_DEVELOPMENT_SETUP.md)

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
│   ├── config/             # Django project settings
│   ├── apps/               # Custom Django apps
│   │   ├── contentmanagement/  # Content management module
│   │   └── usermanagement/     # User management module
│   ├── static/             # Static files
│   ├── media/              # Media uploads
│   ├── requirements.txt    # Python dependencies
│   └── manage.py          # Django management script
├── frontend/              # React frontend application
│   ├── public/            # Public assets
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── api/           # API client code
│   │   └── utils/         # Utility functions
│   ├── package.json       # Node.js dependencies
│   └── .env               # Environment variables
├── aghamazingflutter-master/  # Flutter mobile application
│   ├── lib/               # Dart source code
│   ├── assets/            # Asset files
│   ├── android/           # Android-specific files
│   ├── ios/               # iOS-specific files
│   └── pubspec.yaml       # Flutter dependencies
├── docs/                  # Documentation
├── ECOCODERS_FINAL PAPERS/ # Project papers
└── README.md              # This file
```

## Contributing

We welcome contributions to the project. Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact the development team.