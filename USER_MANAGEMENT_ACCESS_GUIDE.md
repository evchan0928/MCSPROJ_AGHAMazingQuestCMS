# User Management Access Guide

## Important Note About Port Numbers

**The application does not run on port 3002.** The standard React development server runs on port 3000, not 3002. Here's the correct access information:

- **Frontend Application**: `http://localhost:3000` (or `http://172.19.91.23:3000` for network access)
- **Backend API**: `http://172.19.91.23:8080`
- **User Management Page**: `http://localhost:3000/dashboard/users`

## How User Creation Works

### Database Connection
The user creation functionality connects to the PostgreSQL database as follows:

1. **Frontend**: User submits form via React component
2. **API Call**: Form data sent to `/api/users/` endpoint
3. **Backend**: Django REST Framework receives request
4. **Serialization**: UserSerializer processes and validates data
5. **Database**: User object saved to PostgreSQL database

### API Endpoint Details
- **Endpoint**: `POST /api/users/`
- **Authentication**: Requires admin or superuser permissions
- **Data Format**: JSON with fields: `username`, `email`, `first_name`, `last_name`, `is_active`, `is_staff`, `is_superuser`, `roles`, `password`
- **Response**: Created user object with assigned ID

### Database Schema
- **Table**: `auth_user` (Django's built-in user table)
- **Connected to**: PostgreSQL database (`aghamazing_db` on port 5433)
- **Persistence**: All user data is permanently stored in the database

## Correct Access Information

### To access the user management page:
1. Start the backend: `python manage.py runserver 0.0.0.0:8080`
2. Start the frontend: `cd frontend && HOST=0.0.0.0 npm start`
3. Access the frontend: `http://localhost:3000`
4. Navigate to user management: Click "Users" in the sidebar or go to `/dashboard/users`

### To access directly on the network:
1. Go to: `http://172.19.91.23:3000/dashboard/users`

## Verification Steps

### To verify user creation works:
1. Navigate to the user management page
2. Click "Add New User" button
3. Fill in the user details
4. Submit the form
5. Check that:
   - Success message appears
   - New user appears in the user list
   - User can be found in the database

### To verify database persistence:
You can verify that users are saved to the database by:
1. Accessing pgAdmin4 at `http://172.19.91.23/pgadmin4`
2. Connecting to the `aghamazing_db` database
3. Navigating to the `auth_user` table
4. Verifying the new user exists in the table

## Troubleshooting

### If users aren't saving to the database:
1. Check that the backend server is running on port 8080
2. Verify the API endpoint `/api/users/` is accessible
3. Confirm PostgreSQL database is running and accessible
4. Check that the requesting user has admin permissions

### If you get permission errors:
- Ensure you're logged in as a user with Admin or Super Admin role
- Check that your user account has the appropriate permissions

## Backend API Verification

The API endpoints are properly configured in:
- `apps/usermanagement/urls.py`
- `apps/usermanagement/views.py`
- `apps/usermanagement/serializers.py`

These files ensure that user creation requests are properly handled and saved to the PostgreSQL database.