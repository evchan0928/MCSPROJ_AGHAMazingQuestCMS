# AGHAMazingQuestCMS API and Database Documentation

## Overview
This document provides information about the API endpoints and database configuration for the AGHAMazingQuestCMS project.

## Database Configuration

### Neon Serverless PostgreSQL
- **Database Name**: AGHAMazingQuestCMS
- **Host**: ep-withered-pond-a10vxojs-pooler.ap-southeast-1.aws.neon.tech
- **SSL Mode**: require (enforced)
- **Connection Type**: PostgreSQL compatible
- **Access**: Via Django ORM layer

### Database Connection Details
Your application connects to Neon Serverless PostgreSQL through Django's ORM layer. The database credentials are stored securely in your `.env` file and are accessed via the `DATABASE_URL` environment variable.

## API Documentation

### Accessing the API Documentation
The API documentation is available through Swagger UI at:
- Local development: `http://localhost:8000/api/`
- Network access: `http://<your-ip-address>:8000/api/`

### Available API Endpoints
The API provides endpoints for:
- Authentication (`/api/auth/`)
- Content management (`/api/content/`)
- User management (`/api/users/`)
- Analytics (`/api/analytics/`)
- Mobile management (`/api/mobile/`)

### API Technologies Used
- Django REST Framework (DRF)
- Simple JWT for authentication
- drf-yasg for API documentation (Swagger/OpenAPI)

## Network Access Configuration

### Starting the Server on Network Interfaces
To make the server accessible from other devices on your local network:

```bash
# Using the provided script:
./start_network_server.sh
```

This will start the Django development server on all network interfaces (0.0.0.0:8000) instead of just localhost, making it accessible from other devices on your network.

### Accessing from Other Devices
Once the server is started with network access:
- Find your machine's IP address using `hostname -I` or your network settings
- Access the API from other devices using: `http://<your-ip-address>:8000`
- The Swagger UI will be available at: `http://<your-ip-address>:8000/api/`

## Security Considerations
- The Neon database connection uses SSL encryption (sslmode=require)
- API endpoints are protected with JWT authentication
- CORS headers are configured to allow specific origins
- The development server should not be used in production environments

## Troubleshooting
- If other devices cannot access the server, check firewall settings
- Ensure your router allows local network communication
- Verify that your machine's IP address hasn't changed

## Integration with Flutter App
The API endpoints are designed to integrate with the companion Flutter application (`aghamaizingflutter-master`). The API is accessible from the same network as the Django server.