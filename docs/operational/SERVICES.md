# Full Stack Development Services

This document provides information about the running services for the AGHAMazingQuestCMS project.

## Running Services

### Database Services (Docker Containers)

#### PostgreSQL Database
- **Container Name**: `agha-postgres`
- **Port**: 5439 (mapped from 5432)
- **Database Name**: `aghamazing_db`
- **Username**: `admin`
- **Password**: `password123`

#### pgAdmin4
- **Container Name**: `agha-pgadmin`
- **Access URL**: http://localhost:5050
- **Default Email**: admin@aghama.com
- **Default Password**: admin1234

### Backend Service (Django/Wagtail)

#### Django Development Server
- **URL**: http://localhost:8000
- **Admin Interface**: http://localhost:8000/admin/
- **Wagtail Interface**: http://localhost:8000/cms/
- **API Endpoint**: http://localhost:8000/api/

#### Authentication
- **JWT Tokens**: Used for API authentication
- **Superuser**: Can be created with `python manage.py createsuperuser`

### Frontend Service (React)

#### React Development Server
- **URL**: http://localhost:3000
- **API Connection**: Points to http://localhost:8000
- **Environment Variable**: `REACT_APP_API_URL=http://localhost:8000`

## How to Access Each Service

### Accessing the Database
Connect to PostgreSQL using:
- Host: localhost
- Port: 5439
- Database: aghamazing_db
- Username: admin
- Password: password123

### Accessing pgAdmin
1. Open your browser and go to http://localhost:5050
2. Log in with the default credentials
3. Add a new server with:
   - Host: localhost
   - Port: 5439
   - Username: admin
   - Password: password123
   - Database: aghamazing_db

### Accessing the Backend
- Visit http://localhost:8000 to access the main Django application
- Visit http://localhost:8000/admin to access Django admin
- Visit http://localhost:8000/cms to access Wagtail CMS
- API endpoints are available under http://localhost:8000/api/

### Accessing the Frontend
- Visit http://localhost:3000 to access the React frontend application

## Stopping Services

To stop all services:
1. Stop the frontend: Find and kill the npm process (`pkill -f "npm start"`)
2. Stop the backend: Find and kill the Django process (`pkill -f "python manage.py runserver"`)
3. Stop Docker containers:
   ```bash
   docker stop agha-postgres agha-pgadmin
   ```

## Troubleshooting

### If Django server won't start:
1. Make sure the virtual environment is activated:
   ```bash
   cd backend && source venv/bin/activate
   ```
2. Check if migrations need to be run:
   ```bash
   python manage.py migrate
   ```

### If PostgreSQL is not accessible:
1. Verify the container is running: `docker ps`
2. Check if the port is properly mapped: `docker port agha-postgres`
3. Ensure no other PostgreSQL instance is using the same port

### If frontend doesn't connect to backend:
1. Verify the backend is running on http://localhost:8000
2. Check the `REACT_APP_API_URL` environment variable
3. Look for CORS errors in browser console