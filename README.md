# AGHAMazingQuestCMS

A comprehensive content management system for educational content and quests.

## Project Structure

This project follows a modern full-stack architecture:

- **Backend**: Django + Wagtail CMS with PostgreSQL database
- **Frontend**: React application
- **Authentication**: JWT-based authentication system
- **Deployment**: Docker and Docker Compose

## Database Configuration

This project is configured to use **PostgreSQL as the sole database**. All data persistence occurs in PostgreSQL with no fallback to SQLite.

## Authentication System

The application implements a robust JWT-based authentication system:

- **Backend**: Django REST Framework with SimpleJWT
- **Tokens**: Access tokens (15 min expiry) and Refresh tokens (7 day expiry)
- **Frontend**: React with automatic token management and refresh
- **Security**: CSRF protection and CORS configuration for safe cross-origin requests
- **Role-based Access Control**: Custom user roles with different permissions

### Login Flow
- Root path (`/`) directs to the login page ([SignInScreen.jsx](file:///home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/frontend/src/SignInScreen.jsx))
- Supports username or email authentication
- Stores JWT tokens in localStorage
- Automatically redirects to dashboard after successful authentication
- Implements automatic token refresh for seamless user experience

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (either local installation or via Docker)

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd MCSPROJ_AGHAMazingQuestCMS
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Configure your environment:
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL connection details
   ```

5. Run database migrations:
   ```bash
   cd ../backend
   python manage.py migrate
   ```

6. Create a superuser account:
   ```bash
   python manage.py createsuperuser
   ```

7. Start the development servers:
   ```bash
   # Terminal 1: Start the backend
   cd backend
   python manage.py runserver
   
   # Terminal 2: Start the frontend
   cd frontend
   npm start
   ```

## Docker Deployment

To run the entire stack using Docker:

```bash
cd devops
docker-compose -f docker-compose-fullstack.yml up -d
```

## Database Management

With PostgreSQL configured as the primary database:
- Access pgAdmin at http://localhost:5050 (credentials in [.env](file:///home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS/.env))
- All migrations are applied to PostgreSQL
- Data integrity is maintained through PostgreSQL constraints

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