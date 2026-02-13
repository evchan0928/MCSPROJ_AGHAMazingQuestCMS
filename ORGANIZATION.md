# AGHAMazingQuestCMS - Project Organization

This document describes the organized structure of the AGHAMazingQuestCMS project.

## Directory Structure

```
AGHAMazingQuestCMS/
├── README.md                 # Main project overview
├── SETUP_GUIDE.md           # Detailed setup instructions
├── ORGANIZATION.md          # This document
├── start_full_stack.sh      # Start the entire application stack
├── stop_full_stack.sh       # Stop the entire application stack
├── cleanup.sh               # Cleanup temporary/bloat files
├── cleanup_docker.sh        # Cleanup Docker resources
├── .env                    # Environment variables (not committed)
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore rules
├── backend/                # Django backend application
│   ├── config/             # Django settings and URL configurations
│   ├── apps/               # Custom Django apps
│   │   ├── authentication/
│   │   ├── contentmanagement/
│   │   ├── usermanagement/
│   │   └── analyticsmanagement/
│   ├── requirements.txt    # Python dependencies
│   └── manage.py           # Django management script
├── frontend/               # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env*               # Environment files
├── devops/                 # Docker and deployment configurations
│   ├── docker-compose-fullstack.yml    # Main compose file
│   ├── docker-compose-nginx-only.yml   # Nginx proxy service
│   └── deploy/             # Deployment configurations
│       └── nginx.conf      # Nginx reverse proxy configuration
├── docs/                   # Documentation files
└── venv/                   # Python virtual environment (ignored)
```

## Key Files and Their Purpose

### Scripts
- `start_full_stack.sh`: Starts the entire application with proper orchestration
- `stop_full_stack.sh`: Safely stops all services
- `cleanup.sh`: Removes temporary files and caches
- `cleanup_docker.sh`: Cleans Docker resources and obsolete configurations

### Core Configuration
- `.env`: Local environment variables (not in version control)
- `.env.example`: Template for environment variables
- `devops/docker-compose-fullstack.yml`: Main Docker orchestration

## Docker Resources Management

### Active Docker Resources
- Images: `devops-backend`, `devops-frontend`
- Containers: `agha-backend`, `agha-frontend`, `agha-postgres`, `agha-pgadmin4`, `agha-nginx`
- Networks: `devops_agha-network`
- Volumes: Managed by Docker Compose (not directly manipulated)

### Cleanup Process
Use `cleanup_docker.sh` to remove obsolete Docker resources:
1. Stops all containers
2. Removes unused images
3. Prunes volumes and networks
4. Validates system status

## Development Workflow

### Initial Setup
1. `cp .env.example .env`
2. Update `.env` with your configuration
3. `./start_full_stack.sh`

### Daily Operations
- Start: `./start_full_stack.sh`
- Stop: `./stop_full_stack.sh`
- Cleanup: `./cleanup.sh` (files) or `./cleanup_docker.sh` (Docker)

### Maintenance
- Regular cleanup: `./cleanup.sh`
- Docker cleanup: `./cleanup_docker.sh`
- Full reset: Stop → Docker cleanup → Start

## Best Practices

1. **Always use scripts**: Use provided scripts instead of direct Docker commands
2. **Environment consistency**: Maintain consistent environment variables across environments
3. **Regular cleanup**: Periodically run cleanup scripts to prevent bloat
4. **Version control**: Only commit essential files, exclude temporary/runtime files
5. **Documentation**: Update documentation when making structural changes