# AGHAMazingQuestCMS - Mobile AR Tour Application Content Management System

Welcome to the AGHAMazingQuestCMS project, a comprehensive content management system designed for managing content in a mobile augmented reality (AR) tour application for the Department of Science and Technology - Science Education Institute (DOST-SEI).

## 🚀 Development Setup

For complete development environment setup instructions, please refer to the [DEVELOPMENT_SETUP_GUIDE.md](DEVELOPMENT_SETUP_GUIDE.md) file. This contains the official and only recommended setup procedure.

Quick start:
```bash
# Make the setup script executable
chmod +x setup_development.sh

# Run the setup script
./setup_development.sh
```

## 📋 Project Overview

The AGHAMazingQuestCMS is a full-stack application that includes:

- **Frontend**: A React-based content management interface
- **Backend**: A Django REST API with authentication and content management capabilities
- **Database**: PostgreSQL for data persistence
- **Admin Interface**: Django admin for advanced management tasks
- **Documentation**: Comprehensive API documentation

## 🏗️ Architecture

The system consists of several key components:

- **Authentication Module**: Handles user registration, login, and role-based access control
- **Content Management**: Manages AR tour content, articles, and media
- **User Management**: Controls user roles and permissions
- **Analytics**: Tracks content performance and user engagement

## 🌐 Available Services

Once the development environment is set up, the following services will be available:

- **Main Application**: [http://localhost:8080](http://localhost:8080)
- **API Documentation**: [http://localhost:8080/api/swagger/](http://localhost:8080/api/swagger/)
- **Admin Panel**: [http://localhost:8080/admin/](http://localhost:8080/admin/)
- **pgAdmin**: [http://localhost:5050](http://localhost:5050)

## 🛠️ Tech Stack

- **Frontend**: React, JavaScript, Ant Design
- **Backend**: Django, Django REST Framework, Python
- **Database**: PostgreSQL
- **Infrastructure**: Docker, Docker Compose, Nginx

## 👥 User Roles

The system supports multiple user roles with different permissions:

- **Super Admin**: Full system access
- **Admin**: Manage users and content approval
- **Editor**: Create and edit content
- **Encoder**: Input and upload content
- **Approver**: Review and approve content

## 📚 Documentation

- [Development Setup Guide](DEVELOPMENT_SETUP_GUIDE.md) - Official development environment setup
- [Setup Guide](SETUP_GUIDE.md) - Complete setup and usage instructions
- [Quick Start Guide](docs/operational/QUICK_START_TAILSCALE.md)
- [API Architecture](docs/API_ARCHITECTURE.md)
- [Frontend Integration](docs/FLUTTER_INTEGRATION.md)
- [Deployment Guide](docs/operational/DEPLOYMENT.md)

## 📄 License

[Add license information here]