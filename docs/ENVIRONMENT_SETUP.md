# Environment Setup Guide

This document describes how to set up your development environment for AGHAMazingQuestCMS.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- Python 3.9 or higher
- Node.js 16 or higher
- npm (comes with Node.js)
- Git
- PostgreSQL (for local development) or access to Neon Serverless PostgreSQL
- A code editor (VS Code recommended)

## Quick Setup

The easiest way to set up the project is to use the provided setup script:

```bash
chmod +x setup_full_stack.sh
./setup_full_stack.sh
```

This script will:
1. Check all prerequisites
2. Set up the backend with virtual environment
3. Install all dependencies
4. Run database migrations
5. Start the backend server on port 8000
6. Set up and start the frontend server on port 3000 (if available)

## Manual Setup

### Backend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AGHAMazingQuestCMS
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Create a virtual environment:
   ```bash
   python3 -m venv venv
   ```

4. Activate the virtual environment:
   - On Linux/macOS:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

5. Upgrade pip:
   ```bash
   pip install --upgrade pip
   ```

6. Install dependencies:
   ```bash
   pip install -r ../requirements.txt
   ```

7. Set up environment variables:
   ```bash
   cp ../.env.example .env
   # Edit .env with your specific configuration
   ```

8. Run migrations:
   ```bash
   python manage.py migrate
   ```

9. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Database Configuration

The application supports both local PostgreSQL and Neon Serverless PostgreSQL:

### Local PostgreSQL

1. Install PostgreSQL on your system
2. Create a database and user
3. Update your `.env` file with the database connection details:
   ```
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

### Neon Serverless PostgreSQL

1. Sign up for Neon and create a project
2. Update your `.env` file with the Neon connection details:
   ```
   DATABASE_URL='postgresql://username:password@ep-xxxxxxx.region.aws.neon.tech/dbname?sslmode=require'
   ```

## Environment Variables

The following environment variables are available:

### Django Settings
- `DJANGO_SECRET_KEY`: Secret key for cryptographic signing (default provided for development)
- `DJANGO_DEBUG`: Enable/disable debug mode (default: True)
- `DJANGO_ALLOWED_HOSTS`: Comma-separated list of allowed hosts (default: localhost,127.0.0.1)

### Database Settings
- `DATABASE_URL`: Full database connection string (for Neon or other cloud providers)
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_HOST`: Database host
- `DB_PORT`: Database port (default: 5432)
- `DB_SSLMODE`: SSL mode for database connection (default: require)

### CORS Settings
- `CORS_ALLOWED_ORIGIN_REGEXES`: Additional CORS allowed origins (comma-separated)
- `CORS_ALLOW_ALL_ORIGINS`: Allow all origins (default: False)

### CSRF Settings
- `CSRF_TRUSTED_ORIGINS`: Additional CSRF trusted origins (comma-separated)

## Running the Application

### Development Mode
- Backend: `python manage.py runserver`
- Frontend: `npm start`

### Production Mode
- Backend: `gunicorn config.wsgi:application`
- Frontend: `npm run build && serve -s build`

## Stopping Services

To stop all running services, use the provided script:

```bash
./stop_services.sh
```

## Troubleshooting

### Common Issues

1. **Module not found errors**: Ensure your virtual environment is activated and dependencies are installed
2. **Database connection errors**: Verify your database credentials in `.env`
3. **Port already in use**: Change the port in the run command or terminate the conflicting process
4. **Permission errors**: Ensure you have appropriate file system permissions

### Getting Help

- Check the logs for error messages
- Review the environment variables
- Consult the documentation in the `docs/` directory
- Reach out to the development team