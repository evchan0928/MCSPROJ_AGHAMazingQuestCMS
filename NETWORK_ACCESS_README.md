# Full Stack Application - Network Access Guide

This guide explains how to access the AGHAMazingQuestCMS application from your local network.

## Configuration Overview

The application has been configured to allow access from local network addresses:

1. **Backend (Django)**:
   - Updated `ALLOWED_HOSTS` to include common local network addresses
   - Updated `CORS_ALLOWED_ORIGINS` to allow cross-origin requests from local network
   - Uses a strong secret key for security

2. **Frontend (React)**:
   - Configured to connect to the backend via environment variables
   - Properly handles authentication tokens across domains

## How to Access from Local Network

### 1. Find Your Local IP Address

Linux/Mac:
```bash
ip addr show
# Look for an address starting with 192.168.x.x, 10.x.x.x, or 172.x.x.x
```

Windows:
```cmd
ipconfig
```

### 2. Start the Backend Server

Start the backend server to listen on all network interfaces:

```bash
cd /home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

Or use the provided script:
```bash
./start_local_network_backend.sh
```

### 3. Start the Frontend Server

```bash
cd /home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/frontend
npm start
```

Or use the provided script:
```bash
./start_local_network_frontend.sh
```

### 4. Access from Local Network Devices

Once both servers are running, other devices on your local network can access:

- **Frontend Application**: `http://YOUR_LOCAL_IP:3000`
- **Backend API**: `http://YOUR_LOCAL_IP:8000/api/`
- **Admin Panel**: `http://YOUR_LOCAL_IP:8000/admin/`

## Using Different Backend IPs

If you need to connect to the backend from a different IP address, you can set an environment variable in the frontend:

1. In `/home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/frontend/.env`:
```
REACT_APP_BACKEND_API_URL=http://YOUR_LOCAL_IP:8000/api
```

2. Restart the frontend after changing this value:
```bash
cd /home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/frontend
npm start
```

## API Endpoints Available on Network

All API endpoints are accessible from the local network:

- Authentication: `http://YOUR_LOCAL_IP:8000/api/auth/`
- Content Management: `http://YOUR_LOCAL_IP:8000/api/content/`
- User Management: `http://YOUR_LOCAL_IP:8000/api/users/`
- Analytics: `http://YOUR_LOCAL_IP:8000/api/analytics/`

## Security Considerations

These configurations are suitable for development and testing environments. For production use, please implement additional security measures such as:

- HTTPS encryption
- More restrictive host and origin policies
- Proper authentication and authorization
- Rate limiting
- Firewall rules