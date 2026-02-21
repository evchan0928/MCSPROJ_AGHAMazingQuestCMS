# AGHAMazingQuestCMS - Optimized for Local Development

Welcome to the AGHAMazing Quest Content Management System (CMS). This system was developed for the Philippine Department of Science and Technology - Science Education Institute (DOST-SEI) to manage augmented reality (AR) guided tour content for the AGHAMazing Quest project.

## Overview

The AGHAMazingQuestCMS is a full-stack web application featuring:
- A React-based frontend for content management
- A Django REST API backend for data handling
- Role-based access control for content creators, approvers, and administrators

## Tech Stack

- **Frontend**: React 18, Ant Design, Axios
- **Backend**: Django 6+, Django REST Framework
- **Database**: PostgreSQL
- **Local Development**: Python Virtual Environment (venv)

## Development Setup

For a complete development environment setup, please refer to our comprehensive guide:

[Full Stack Development Setup Guide](FULL_STACK_DEVELOPMENT_SETUP.md)

For daily development quick start, see:

[Quick Start Guide](QUICK_START_GUIDE.md)

## Scripts

We provide automated setup scripts to simplify the environment configuration:

- [setup_full_stack.sh](setup_full_stack.sh): Automated setup script for the full-stack development environment
- [start_development.sh](start_development.sh): Script to start the development servers
- [start_cms_only.sh](start_cms_only.sh): Optimized script for CMS-only development in venv

## Architecture

The system consists of two main components:

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

## Getting Started with CMS-only Development

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

3. For optimized CMS-only development in venv:
   ```bash
   ./start_cms_only.sh
   ```

## Running the CMS

### Terminal 1 - Backend Server
```bash
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend
source venv/bin/activate
python manage.py runserver 8001
```

### Terminal 2 - Frontend Server
```bash
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/frontend
npm start
```

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
└── ...
```

## API Documentation

API documentation is available via Swagger when the backend is running at `http://localhost:8001/api/swagger/`.

## Optimized Development Features

- Pure Python virtual environment (venv) approach
- No Docker dependencies
- Faster startup times
- Simplified debugging
- Direct access to system resources

## Contributing

Please read the [Full Stack Development Setup Guide](FULL_STACK_DEVELOPMENT_SETUP.md) before contributing to ensure your development environment is properly configured.

## License

This project is developed for DOST-SEI. For licensing information, please contact the project maintainers.