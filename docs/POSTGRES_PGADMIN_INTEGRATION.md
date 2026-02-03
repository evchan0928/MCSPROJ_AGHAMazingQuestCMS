# PostgreSQL and pgAdmin4 Integration Guide

## Overview
This document explains how to access and manage your PostgreSQL database using pgAdmin4 web interface, which has been successfully configured with the AGHAMazingQuestCMS application.

## pgAdmin4 Access Information

### Web Interface
- URL: http://localhost/pgadmin4
- Default credentials were set during setup (email: jtstana2@student.apc.edu.ph)

### Database Connection Details
- Host: localhost
- Port: 5433 (PostgreSQL custom port)
- Database: aghamazing_db
- Username: postgres
- Password: admin123

## Connecting to Your Database

### Step 1: Access pgAdmin4 Web Interface
1. Open your browser
2. Navigate to: `http://localhost/pgadmin4`
3. Log in with your credentials

### Step 2: Add Server Connection
1. Right-click on "Servers" in the left panel
2. Select "Create" → "Server..."
3. On the "General" tab, give it a name like "AGHAMazingQuestCMS DB"
4. On the "Connection" tab, enter:
   - Host: `localhost`
   - Port: `5433` (your PostgreSQL port)
   - Maintenance database: `aghamazing_db`
   - Username: `postgres`
   - Password: `admin123`

## Database Schema Overview

### Content Management Tables
- `contentmanagement_contentitem`: Core content workflow model with status tracking
- `contentmanagement_contentpage`: Wagtail Page model for content management
- Related tables for content workflow and tracking

### User Management Tables
- `auth_user`: Django's built-in user model
- `auth_group`: Django groups for role-based access control
- `auth_user_groups`: Junction table for user-group relationships

### Wagtail CMS Tables
- Multiple tables supporting the Wagtail CMS functionality
- Document management, image handling, and page management tables

### Analytics Tables
- Various tables for analytics and reporting (as implemented)

## Database Health Checks

### Using Django Management Commands
Run the following command to verify database integrity:
```bash
cd /home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS
python manage.py check_integrity
```

### Migration Status
All 225 migrations have been applied successfully. To verify:
```bash
python manage.py showmigrations
```

## Troubleshooting

### Common Issues

1. **Cannot connect to database**
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Check the correct port is being used (default is 5433 for this project)
   - Ensure credentials are correct

2. **pgAdmin4 not accessible**
   - Verify Apache is running: `sudo systemctl status apache2`
   - Check pgAdmin4 configuration is enabled: `sudo a2enconf pgadmin4`
   - Ensure required directories have correct permissions:
     - `/var/lib/pgadmin` owned by `www-data:www-data`
     - `/var/log/pgadmin` owned by `www-data:www-data`

3. **Permission errors**
   - Make sure you're using the correct credentials
   - Check that the database user has appropriate permissions

## Security Considerations

### Production Deployment
- Change default passwords immediately
- Restrict network access to the database
- Use SSL/TLS encryption for connections
- Implement proper backup procedures

### Staging Environment
- Default credentials are acceptable for staging
- Ensure staging environment is isolated from production
- Regular cleanup of staging data

## Verification Checklist

- [x] PostgreSQL running on port 5433
- [x] pgAdmin4 web interface accessible at http://localhost/pgadmin4
- [x] All 225 migrations applied successfully
- [x] Content management tables exist and accessible
- [x] User management tables properly configured
- [x] Wagtail CMS tables integrated
- [x] Database connectivity verified
- [x] Management commands functional

## Next Steps

1. Log into pgAdmin4 using the connection details above
2. Explore the database schema and tables
3. Run queries to verify data integrity
4. Set up any additional monitoring or backup procedures as needed

Your PostgreSQL database is fully integrated with pgAdmin4 and ready for management and monitoring.