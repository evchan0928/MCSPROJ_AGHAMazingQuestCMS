# AGHAMazingQuestCMS

An educational content management system built with React frontend and Django/Wagtail backend, featuring comprehensive dashboard and role-based access control.

## Features

- **Full-Stack Dashboard**: Comprehensive dashboard with real-time data from all system components
- **Role-Based Access Control**: Different permissions for encoders, editors, approvers, admins, and super admins
- **Content Lifecycle Management**: Complete workflow from creation to publication
- **Advanced Analytics**: Detailed reports and insights
- **Secure Authentication**: JWT-based authentication with refresh token support

## Dashboard Overview

The dashboard provides real-time visibility into:

- **Content Metrics**: Published content, pending approvals, and content lifecycle tracking
- **User Management**: Active users, roles, and permissions overview
- **System Analytics**: Usage statistics and performance metrics
- **Recent Activity**: Latest content updates and user actions

## Architecture

```
Internet -> nginx (Port 80/443) -> React Frontend & Django/Wagtail Backend
                     |
              -------------------
              |                 |
       Django/Wagtail      React App
       PostgreSQL          (Served by nginx)
```

## Setup

See [FULL_STACK_SETUP.md](FULL_STACK_SETUP.md) for detailed setup instructions.



## Environment Variables

Both backend and frontend applications require environment variables to be configured properly. Check the `.env.example` files in each directory for required variables.

## Running Tests

Backend tests can be run with:
```bash
cd backend/
python manage.py test
```

Frontend tests can be run with:
```bash
cd frontend/
npm test
```

## Deployment

For deployment instructions, check the files under the [devops](file:///home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS/devops) directory.