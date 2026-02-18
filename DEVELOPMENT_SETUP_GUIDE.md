# Development Setup Guide

This guide provides instructions for setting up the development environment for the Aghamazing Quest CMS project.

## Prerequisites

- Python 3.12+
- Node.js 18+ (with npm)
- PostgreSQL 12+
- Git

## Recommended Development Environment

For the best experience, we recommend using VSCode with the following extensions:
- `dart-code.dart-code`
- `dart-code.flutter`
- `ms-python.python`
- `ms-vscode.vscode-json`
- `bradlc.vscode-tailwindcss`
- `esbenp.prettier-vscode`

## Initial Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd MCSPROJ_AGHAMazingQuestCMS
   ```

2. Navigate to the backend directory and set up Python virtual environment:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up the database:
   - Install and start PostgreSQL on your system
   - Create a database for the project:
     ```sql
     CREATE DATABASE agha_cms;
     CREATE USER agha_user WITH PASSWORD 'your_strong_password';
     ALTER ROLE agha_user SET client_encoding TO 'utf8';
     ALTER ROLE agha_user SET default_transaction_isolation TO 'read committed';
     ALTER ROLE agha_user SET timezone TO 'UTC';
     GRANT ALL PRIVILEGES ON DATABASE agha_cms TO agha_user;
     ALTER USER agha_user CREATEDB;
     ```
   - Update the `.env` file in the backend directory with your database credentials

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Create a superuser account:
   ```bash
   python manage.py createsuperuser
   ```

6. Populate sample data (optional):
   ```bash
   python manage.py populate_sample_data
   ```

7. Create content roles:
   ```bash
   python manage.py create_content_roles
   ```

8. Start the backend server:
   ```bash
   python manage.py runserver 8001
   ```

9. In a new terminal, navigate to the frontend directory and set up the React application:
   ```bash
   cd ../frontend  # From the backend directory
   npm install
   ```

10. Configure environment variables for the frontend:
    - Copy `.env.example` to `.env`
    - Update `REACT_APP_BACKEND_API_URL` to point to your backend (e.g., `http://localhost:8001`)

11. Start the frontend development server:
    ```bash
    npm start
    ```

The application should now be accessible at `http://localhost:3000`.

## Project Structure

```
MCSPROJ_AGHAMazingQuestCMS/
├── backend/                 # Django REST API backend
│   ├── config/             # Django project settings
│   ├── apps/               # Custom Django apps
│   │   ├── contentmanagement/  # Content management module
│   │   └── usermanagement/     # User management module
│   ├── static/             # Static files
│   ├── media/              # Media uploads
│   ├── requirements.txt    # Python dependencies
│   └── manage.py          # Django management script
├── frontend/              # React frontend application
│   ├── public/            # Public assets
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── api/           # API client code
│   │   └── utils/         # Utility functions
│   ├── package.json       # Node.js dependencies
│   └── .env               # Environment variables
├── aghamazingflutter-master/  # Flutter mobile application
└── docs/                  # Documentation
```

## Running the Application

1. Make sure PostgreSQL is running on your system
2. Activate the Python virtual environment in the backend directory:
   ```bash
   cd backend
   source venv/bin/activate
   ```
3. Start the backend server:
   ```bash
   python manage.py runserver 8001
   ```
4. In a new terminal, navigate to the frontend directory and start the React development server:
   ```bash
   cd frontend
   npm start
   ```

## Troubleshooting

### Backend Issues

**Problem**: Database connection errors
**Solution**: Ensure PostgreSQL is running and credentials in `.env` are correct

**Problem**: Migration errors
**Solution**: 
- Ensure your virtual environment is activated
- Confirm database permissions are properly set (`GRANT ALL PRIVILEGES` and `CREATEDB`)

### Frontend Issues

**Problem**: Cannot connect to backend API
**Solution**: Verify `REACT_APP_BACKEND_API_URL` in frontend `.env` matches the backend address

**Problem**: Module resolution errors
**Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

### General Issues

**Problem**: Permission errors
**Solution**: Ensure you're using a virtual environment and not installing packages globally

## API Endpoints

The backend API is available at `http://localhost:8001/api/` when running locally.

Key endpoints:
- Authentication: `/api/auth/`
- Users: `/api/users/`
- Content: `/api/content/`
- Roles: `/api/roles/`
- Mobile: `/api/mobile/`

## Mobile Application

The Flutter mobile application is located in the `aghamazingflutter-master` directory. To run it:

1. Navigate to the Flutter directory:
   ```bash
   cd aghamazingflutter-master
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Run the application:
   ```bash
   flutter run
   ```
   
   Note: Make sure you have Android Studio/SDK installed or iOS development tools as appropriate.

## Testing

To run backend tests:
```bash
python manage.py test
```

To run frontend tests:
```bash
npm test
```

## Production Deployment

For production deployment, follow these steps:

1. Backend:
   - Collect static files: `python manage.py collectstatic --noinput`
   - Use a production-ready server like Gunicorn: `gunicorn config.wsgi:application`

2. Frontend:
   - Build the application: `npm run build`
   - Serve the build directory using a web server like Nginx