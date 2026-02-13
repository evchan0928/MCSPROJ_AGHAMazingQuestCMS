# AGHAMazingQuestCMS Development Setup Guide

This is the **official and only** development setup guide for the AGHAMazingQuestCMS project. Follow these instructions to set up your local development environment.

## Prerequisites

Before starting, ensure you have the following installed on your system:

- **Docker** (version 20.10 or higher)
- **Docker Compose V2** (not the old docker-compose)
- **Node.js** (version 18 or higher)
- **npm** (version 8 or higher)
- **Git**

## Quick Setup (Recommended)

The fastest way to get started is using the provided setup script:

```bash
# Make the setup script executable
chmod +x setup_development.sh

# Run the setup script
./setup_development.sh
```

This script will:
1. Verify all prerequisites
2. Configure the development environment
3. Build and start all services
4. Run database migrations
5. Populate sample data
6. Perform system verification

## Manual Setup (Alternative)

If you prefer to set up manually, follow these steps:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MCSPROJ_AGHAMazingQuestCMS
```

### 2. Build and Start Services

```bash
# Navigate to the devops directory
cd devops

# Build and start all services
docker compose -f docker-compose-fullstack.yml up -d --build
```

### 3. Initialize Database

```bash
# Run database migrations
docker exec agha-backend python manage.py migrate

# Populate sample data
docker exec agha-backend python manage.py populate_sample_data
```

## Available Services

Once setup is complete, the following services will be available:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | [http://localhost:8080](http://localhost:8080) | Main application interface |
| API | [http://localhost:8080/api/](http://localhost:8080/api/) | Backend API endpoints |
| Admin Panel | [http://localhost:8080/admin/](http://localhost:8080/admin/) | Django admin interface |
| pgAdmin | [http://localhost:5050](http://localhost:5050) | PostgreSQL administration |

## Demo User Credentials

The system comes pre-populated with demo users for different roles:

| Role | Username | Password |
|------|----------|----------|
| Demo User | `demo_user` | `demopass123` |
| Encoder | `encoder_user` | `demopass123` |
| Editor | `editor_user` | `demopass123` |
| Approver | `approver_user` | `demopass123` |
| Admin | `admin_user` | `demopass123` |
| Super Admin | `superadmin` | `demopass123` |

## Development Workflow

### Making Changes to the Frontend

1. The frontend runs in development mode with hot reloading
2. Changes to files in the `frontend/` directory will automatically reload
3. The frontend is accessible at [http://localhost:8080](http://localhost:8080)

### Making Changes to the Backend

1. The backend runs in development mode
2. Changes to Python files in the `backend/` directory may require container restart
3. To restart the backend: `docker restart agha-backend`

### Accessing Logs

```bash
# View all service logs
docker compose -f docker-compose-fullstack.yml logs

# View specific service logs
docker logs agha-backend
docker logs agha-frontend
docker logs agha-nginx
```

## Troubleshooting

### Common Issues

**Issue**: Frontend shows a blank page
**Solution**: Clear browser cache and refresh the page

**Issue**: Authentication fails
**Solution**: Ensure you're using the correct credentials from the table above

**Issue**: API endpoints return 404
**Solution**: Verify that the backend service is running: `docker ps | grep agha-backend`

**Issue**: Cannot connect to database
**Solution**: Check that postgres is running: `docker ps | grep agha-postgres`

### Resetting the Environment

If you encounter persistent issues, you can reset the environment:

```bash
# Stop the environment
./stop_development.sh

# Clean up Docker resources
docker system prune -f

# Restart the environment
./setup_development.sh
```

## Stopping the Development Environment

When you're done working, stop the development environment:

```bash
# Make the stop script executable
chmod +x stop_development.sh

# Run the stop script
./stop_development.sh
```

## Additional Notes

- All services run in Docker containers for consistency across environments
- The nginx server acts as a reverse proxy, routing requests to the appropriate services
- The frontend and backend communicate through the API endpoints
- Data is persisted in the PostgreSQL database
- Changes to the Dockerfile or docker-compose file require rebuilding: `docker compose -f docker-compose-fullstack.yml up -d --build`

---

**Important**: This is the official and only development setup guide. Ignore any other setup instructions you might find in the repository. If you encounter issues, contact the development team rather than attempting alternative setup methods.