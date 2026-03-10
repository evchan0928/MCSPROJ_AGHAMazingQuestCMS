# Deployment Guide

## Prerequisites
- Docker and Docker Compose
- Git
- At least 4GB RAM available

## Environment Configuration
1. Copy `.env.example` to `.env`
2. Update database credentials and API keys as needed
3. Verify all required environment variables are set

## Building the Application
```bash
# Clone the repository
git clone <repository-url>
cd AGHAMazingQuestCMS

# Build and start the application
docker-compose up --build -d
```

## Initial Setup
After the first build:
1. Run database migrations: `docker-compose exec backend python manage.py migrate`
2. Create a superuser: `docker-compose exec backend python manage.py createsuperuser`
3. Collect static files: `docker-compose exec backend python manage.py collectstatic --noinput`

## Monitoring
- Application logs: `docker-compose logs -f`
- Database: Access via pgAdmin on port 5050
- Container metrics: Access via Portainer on port 9000
