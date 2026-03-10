# AGHAMazingQuestCMS - Project Structure

## Overview
This document describes the organization of the AGHAMazingQuestCMS project.

## Directory Structure
```
AGHAMazingQuestCMS/
├── backend/                 # Django REST API backend
│   ├── apps/               # Custom Django applications
│   │   ├── contentmanagement/     # Content management functionality
│   │   ├── usermanagement/        # User management functionality  
│   │   ├── mobilemanagement/      # Mobile app integration
│   │   └── analyticsmanagement/   # Analytics functionality
│   ├── config/             # Django settings and configuration
│   ├── middleware/         # Custom middleware
│   ├── staticfiles/        # Collected static files
│   ├── media/              # Uploaded media files
│   ├── manage.py           # Django management utility
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend application
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   ├── package.json        # Node.js dependencies
│   └── build/              # Production build
├── scripts/                # Utility and deployment scripts
├── docs/                   # Documentation
├── .env                    # Environment variables
├── .env.example            # Environment variables template
├── docker-compose.yml      # Docker services configuration
├── README.md               # Main project documentation
└── setup_full_stack.sh     # Main setup script
```

## Key Files
- `docker-compose.yml` - Defines all services for the application
- `setup_full_stack.sh` - Main script to start the complete application
- `backend/requirements.txt` - Python dependencies
- `frontend/package.json` - JavaScript dependencies

## Important Notes
- All custom Django apps are in `backend/apps/`
- Authentication logic is in `backend/apps/authentication/`
- Environment variables should be set in `.env`
- Docker is the primary deployment method