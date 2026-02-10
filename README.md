# AGHAMazingQuestCMS

A comprehensive content management system for educational content and quests built with Django, React, and PostgreSQL.

## 🚀 Quick Start (Docker)

1. **Clone and setup environment:**
   ```bash
   git clone <repository-url>
   cd MCSPROJ_AGHAMazingQuestCMS
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start the full stack:**
   ```bash
   cd devops
   docker-compose -f docker-compose-fullstack.yml up -d
   ```

3. **Access the application:**
   - **Frontend**: `http://100.93.255.84:3000`
   - **Backend API**: `http://100.93.255.84:8000/api`
   - **pgAdmin**: `http://100.93.255.84:5050`
   - **Portainer**: `https://100.93.255.84:9443`

## 📋 Features

- **Backend**: Django REST Framework with PostgreSQL
- **Frontend**: React application with JWT authentication
- **Authentication**: JWT tokens with automatic refresh
- **Database**: PostgreSQL with pgAdmin management
- **Deployment**: Docker Compose with Portainer monitoring
- **Security**: CSRF protection, CORS, role-based access control

## 🛠 Prerequisites

- Docker and Docker Compose
- Tailscale (for remote access)

## 📚 Documentation

- [Quick Start Guide](docs/operational/QUICK_START_TAILSCALE.md)
- [API Architecture](docs/API_ARCHITECTURE.md)
- [Frontend Integration](docs/FLUTTER_INTEGRATION.md)
- [Deployment Guide](docs/operational/DEPLOYMENT.md)

## 🔧 Development

For local development without Docker:

1. Install Python 3.11+ and Node.js 18+
2. Install dependencies: `pip install -r backend/requirements.txt` and `cd frontend && npm install`
3. Run migrations: `cd backend && python manage.py migrate`
4. Start servers: `python manage.py runserver` (backend) and `npm start` (frontend)

## 📄 License

[Add license information here]