# NGINX Deployment Guide for AGHAMazingQuestCMS

## Overview

This document describes the nginx reverse proxy configuration that integrates the React frontend and Django/Wagtail backend into a unified application accessible via port 80.

## Architecture

The nginx server acts as a reverse proxy that:
- Serves the React frontend for general requests
- Proxies API requests to the Django backend
- Handles admin and CMS interfaces
- Manages static and media files

## Configuration Details

### Location Blocks

- `/api/` → Django backend API endpoints
- `/cms/` → Wagtail CMS administration
- `/admin/` → Django administration
- `/static/` → Django static files
- `/media/` → Django media files
- `/` → React frontend (catch-all)

### Key Features

1. **SPA Support**: Proper handling of React Router client-side navigation
2. **Security Headers**: XSS protection, clickjacking prevention, etc.
3. **Proxy Settings**: Correct headers passed to backend services
4. **Path Preservation**: Maintains correct URL structure for backend routing

## Service Dependencies

This configuration assumes:
- Django backend running on `127.0.0.1:8000`
- React development server on `127.0.0.1:3000`

## Running the Application

1. Ensure backend is running: `cd backend && python manage.py runserver 8000`
2. Ensure frontend is running: `cd frontend && npm start`
3. Nginx will automatically route requests appropriately

## Testing the Deployment

- Frontend: `curl -I http://localhost`
- API: `curl -X POST http://localhost/api/auth/login/ -H "Content-Type: application/json" -d '{"username":"admin", "password":"admin123"}'`
- Current User: `curl -H "Authorization: Bearer <access_token>" http://localhost/api/auth/me/`
- Content API: `curl -H "Authorization: Bearer <access_token>" http://localhost/api/content/items/`
- Admin: `curl -I http://localhost/admin/`
- CMS: `curl -I http://localhost/cms/`

## Troubleshooting

- If API endpoints return 404, check that the backend is running on port 8000
- If the frontend doesn't load, check that the React development server is running on port 3000
- Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Check nginx access logs: `sudo tail -f /var/log/nginx/access.log`

## Production Considerations

For production deployment, consider:
- Switching from React development server to built static assets
- SSL/TLS termination
- Caching strategies
- Rate limiting
- Log rotation
- Security hardening