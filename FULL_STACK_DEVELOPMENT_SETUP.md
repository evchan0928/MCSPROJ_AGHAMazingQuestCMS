# AGHAMazingQuestCMS - Comprehensive Full Stack Development Setup

## Overview
This document provides a complete, optimized setup guide for the AGHAMazingQuestCMS application. It combines all necessary components for a high-performance development environment.

## Prerequisites

- **Docker** (version 20.10 or higher)
- **Docker Compose V2** (not the old docker-compose)
- **Node.js** (version 18 or higher)
- **npm** (version 8 or higher)
- **Git**
- Minimum 4GB RAM and 5GB disk space

## Quick Setup (Recommended)

The fastest way to get started is using the provided optimized setup script:

```bash
# Make the setup script executable
chmod +x setup_optimized.sh

# Run the optimized setup script
./setup_optimized.sh
```

## Detailed Architecture

### Service Components
- **PostgreSQL Database**: Persistent storage with pgAdmin interface
- **Django Backend**: REST API with authentication and content management
- **React Frontend**: Dynamic user interface with live reloading
- **Nginx Proxy**: Reverse proxy for unified access and routing
- **Network**: Custom Docker network for optimized communication

### Network Configuration
- All services communicate through a dedicated Docker network (`agha-network`)
- Frontend and backend communicate internally via service names
- Nginx serves as the unified entry point for all client requests
- Optimized for both development and production-like environments

### Port Configuration
- **Application Access**: http://localhost:8081 (Nginx proxy) - used when 8080 is occupied
- **Legacy Port**: http://localhost:8080 (when available)
- **API Endpoint**: http://localhost:8081/api/ (or :8080/api/ if using legacy port)
- **Admin Panel**: http://localhost:8081/admin/ (or :8080/admin/ if using legacy port)
- **Database Admin**: http://localhost:5050 (pgAdmin)
- **Internal Backend**: http://localhost:8000
- **Internal Frontend**: http://localhost:3000

## Pre-configured Demo Accounts

After setup, the following accounts will be available:

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| Demo User | `demo_user` | `demopass123` | Read-only access |
| Encoder | `encoder_user` | `demopass123` | Content creation |
| Editor | `editor_user` | `demopass123` | Content editing |
| Approver | `approver_user` | `demopass123` | Content approval |
| Admin | `admin_user` | `demopass123` | Administrative tasks |
| Super Admin | `superadmin` | `superadmin123` | Full system access |

## Development Workflow

### Performance Optimization Tips
1. **Container Resource Limits**: Set appropriate CPU and memory limits in Docker Desktop
2. **Volume Mounts**: Use named volumes for databases and anonymous volumes for caches
3. **Build Caching**: Leverage Docker layer caching for faster rebuilds
4. **Hot Reloading**: Frontend updates reflect immediately in development mode

### Making Changes
1. **Frontend**: Changes to [frontend/src](file:///home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/frontend/src) automatically reload in the browser
2. **Backend**: Changes to [backend/](file:///home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend) may require restarting the backend container
3. **Configuration**: Changes to nginx config require restarting the nginx container

### Development Commands
```bash
# Restart backend after code changes
docker restart agha-backend

# View all service logs
docker compose -f devops/docker-compose-fullstack.yml logs -f

# Run Django management commands
docker exec -it agha-backend python manage.py <command>

# Execute database migrations
docker exec -it agha-backend python manage.py migrate

# Run tests
docker exec -it agha-backend python manage.py test
```

## Performance Monitoring

### Resource Usage
- **PostgreSQL**: ~200MB RAM baseline, increases with data size
- **Backend (Django)**: ~150MB RAM baseline, varies with load
- **Frontend (React Dev Server)**: ~200MB RAM
- **Nginx**: ~10MB RAM
- **Total baseline**: ~560MB RAM

### Health Checks
The optimized setup includes health checks for all services:
- Database connectivity verification
- Backend API response time monitoring
- Frontend availability testing
- Authentication flow validation

## Troubleshooting

### Common Issues

**Issue**: Port 8080 is already in use by another service
**Solution**: The application will automatically run on port 8081. Access via http://localhost:8081

**Issue**: Slow initial load times
**Solution**: Ensure Docker has sufficient allocated resources (minimum 4GB RAM)

**Issue**: Frontend not refreshing after changes
**Solution**: Clear browser cache and verify WebSocket connection to hot-reload server

**Issue**: Database connection errors
**Solution**: Check that PostgreSQL is running and credentials match [backend/.env](file:///home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend/.env)

**Issue**: Authentication fails
**Solution**: Verify credentials from the table above and check that backend is running

**Issue**: API calls returning CORS errors
**Solution**: Ensure all traffic goes through the nginx proxy (port 8081), not direct backend access

### Network Optimization
- All containers run on the same custom network for minimal latency
- Service discovery uses internal DNS names for fast resolution
- Nginx proxy efficiently routes requests without significant overhead

## Optimized Environment Scripts

### Setup Script Features
- Prerequisite verification before installation
- Automatic network creation for services
- Dependency checking and installation guidance
- Service readiness validation
- System health verification

### Cleanup and Maintenance
```bash
# Stop development environment
./stop_optimized.sh

# Clean Docker resources
docker system prune -f

# Reset entire environment
./reset_environment.sh
```

## Production Parity

The development environment closely mirrors production:
- Same Docker images and configurations
- Identical network topology
- Matching environment variables
- Equal port mappings
- Consistent service dependencies

## Support and Maintenance

### Getting Help
- Check the logs: `docker compose -f devops/docker-compose-fullstack.yml logs`
- Verify network connectivity: `docker network ls` and `docker ps`
- Confirm resource allocation in Docker Desktop settings

### Updates
- Monitor the repository for updates to this setup guide
- Regularly pull latest changes and rebuild if needed
- Keep Docker and related tools updated to the latest stable versions

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Primary Contact**: Development Team  
**Validated On**: Linux, macOS, Windows (with WSL2)