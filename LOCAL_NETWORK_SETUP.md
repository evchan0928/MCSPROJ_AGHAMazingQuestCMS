# Local Network API Access Setup Guide

## Backend Configuration

The Django backend has been configured to accept connections from local network addresses:

- Updated `ALLOWED_HOSTS` in `config/settings/base.py` to include common local network addresses
- Updated `CORS_ALLOWED_ORIGINS` to allow requests from local network addresses

## Starting the Backend Server on Local Network

To expose the backend API to your local network, run the Django development server binding to all interfaces:

```bash
cd /home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

This will make the backend accessible on port 8000 from any device on your local network using your computer's IP address (e.g., `http://192.168.1.100:8000`).

## Starting the Frontend Server on Local Network

To expose the frontend to your local network:

```bash
cd /home/apcadmin/MCSPROJ_AGHAMazingQuestCMS/frontend
npm start
```

The React development server will automatically be accessible from your local network.

## Finding Your Local IP Address

To find your computer's local IP address:

### Linux/Mac:
```bash
ip addr show
# or
ifconfig
```

Look for an address starting with 192.168.x.x, 10.x.x.x, or 172.x.x.x

### Windows:
```cmd
ipconfig
```

## Accessing the Applications from Local Network

Once the servers are running with the configurations above:

- Backend API: `http://YOUR_LOCAL_IP:8000`
- Frontend: `http://YOUR_LOCAL_IP:3000`
- Admin panel: `http://YOUR_LOCAL_IP:8000/admin/`
- API endpoints: `http://YOUR_LOCAL_IP:8000/api/auth/`, `http://YOUR_LOCAL_IP:8000/api/content/`, etc.

## Security Considerations

When exposing services to the local network:

1. These configurations are intended for development/testing purposes
2. Do not use these settings in production without proper security measures
3. Ensure your firewall permits traffic on ports 8000 and 3000 on your local network
4. Consider using VPN or other security measures if accessing from untrusted devices on the network

## Troubleshooting

If you have issues accessing the services from other devices:

1. Check that your firewall is not blocking the ports
2. Verify that the servers are running with `0.0.0.0` binding for the backend
3. Confirm your local IP address is correct
4. Try accessing the services from the local machine using the local IP to verify they are bound correctly