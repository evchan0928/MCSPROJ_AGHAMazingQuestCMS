# AGHAMazingQuestCMS Setup Guide

This guide provides instructions for setting up and running the AGHAMazingQuestCMS application.

## Prerequisites

- Docker and Docker Compose
- At least 4GB free disk space
- Port 8080 available (or 8081 if 8080 is in use)

## Quick Start

### 1. Clone and setup environment:

```bash
git clone <repository-url>
cd AGHAMazingQuestCMS
cp .env.example .env
# Edit .env with your configuration if needed
```

### 2. Start the full stack:

```bash
# Make sure the scripts are executable
chmod +x start_full_stack.sh stop_full_stack.sh

# Start the application
./start_full_stack.sh
```

### 3. Initialize the database:

```bash
# Create content roles
docker exec -it agha-backend python manage.py create_content_roles

# Populate sample data
docker exec -it agha-backend python manage.py populate_sample_data

# Create a superuser (optional but recommended)
docker exec -e DJANGO_SUPERUSER_USERNAME=admin -e DJANGO_SUPERUSER_EMAIL=admin@example.com -e DJANGO_SUPERUSER_PASSWORD=admin123 agha-backend python manage.py createsuperuser --noinput
```

### 4. Access the application:

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8080/api/
- **Admin Panel**: http://localhost:8080/admin/
- **pgAdmin**: http://localhost:5050

## Available Demo Users

After running `populate_sample_data`, the following demo users are created:

- `demo_user` (password: `demopass123`)
- `encoder_user` (password: `demopass123`)
- `editor_user` (password: `demopass123`)
- `approver_user` (password: `demopass123`)
- `admin_user` (password: `demopass123`)
- `superadmin` (password: `superadmin123`)

## Stopping the Application

```bash
./stop_full_stack.sh
```

## Troubleshooting

### Port 8080 is already in use

If port 8080 is already in use by another service (e.g., system nginx):

1. Stop the conflicting service: `sudo systemctl stop nginx`
2. Restart the application stack
3. When stopping the application, restart the service: `sudo systemctl start nginx`

### Database Connection Issues

If you encounter database connection issues:
1. Verify that the `agha-postgres` container is running
2. Check the database credentials in your `.env` file
3. Confirm that the backend can connect to the database

### Frontend/Backend Communication

The application is designed to be accessed through the nginx proxy at http://localhost:8080.
Direct access to individual services (e.g., http://localhost:3000 or http://localhost:8000) may result in CORS issues.

## Architecture Overview

The application consists of:
- PostgreSQL database (with pgAdmin)
- Django backend API
- React frontend
- Nginx reverse proxy (unified access point)

All communication flows through the nginx proxy to ensure proper CORS handling and unified access.

# Development Setup Guide - DEPRECATED

⚠️ **NOTICE**: This guide is deprecated. Please use the new comprehensive setup guide instead.

## New Setup Guide

For the official and up-to-date development setup instructions, please refer to: [DEVELOPMENT_SETUP_GUIDE.md](DEVELOPMENT_SETUP_GUIDE.md)

This new guide contains:
- Complete setup instructions for local development
- Troubleshooting tips
- Single authoritative source for setup procedures
- All necessary scripts and configurations

## Why This Guide Is Deprecated

We consolidated all setup instructions into a single, comprehensive guide to prevent confusion and ensure all developers follow the same proven process.

## Action Required

Please use [DEVELOPMENT_SETUP_GUIDE.md](DEVELOPMENT_SETUP_GUIDE.md) for all development setup procedures. This file will be removed in a future update.
