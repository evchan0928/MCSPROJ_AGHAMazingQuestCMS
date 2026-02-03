# Monitoring AGHAMazingQuestCMS in pgAdmin4

This guide explains how to monitor your Django/Wagtail application's PostgreSQL database using pgAdmin4.

## Database Structure in PostgreSQL

When you run the Django migrations, several schemas and tables are created in PostgreSQL:

### Django Core Tables
- `auth_user`: User accounts and authentication
- `django_admin_log`: Administrative log of user actions
- `django_content_type`: Content type framework
- `django_migrations`: Applied migration records
- `django_session`: User session data

### Wagtail CMS Tables
- `wagtailcore_page`: Core page hierarchy
- `wagtaildocs_document`: Document storage
- `wagtailimages_image`: Image storage
- `wagtailsites_site`: Site configuration
- `wagtailusers_userprofile`: User profiles

### Application-Specific Tables
- `contentmanagement_contentitem`: Content items managed in the system
- `contentmanagement_contentpage`: Wagtail-powered content pages
- `authentication_*`: Custom authentication tables
- `usermanagement_*`: User management tables
- `analyticsmanagement_*`: Analytics tracking tables

## Setting up pgAdmin4 Connection

### 1. Open pgAdmin4
- Web version: Visit http://localhost/pgadmin4 after installation
- Desktop version: Launch the pgAdmin4 application

### 2. Add Server Connection
1. Right-click "Servers" in the left sidebar
2. Select "Create" → "Server..."
3. In the "General" tab:
   - Name: "AGHAMazingQuestCMS Development" (or any descriptive name)
4. In the "Connection" tab:
   - Host name/address: `localhost`
   - Port: `5433` (based on your setup)
   - Maintenance database: `aghamazing_db`
   - Username: `postgres`
   - Password: `admin123`

### 3. Connect to the Server
After saving, click the server to establish the connection.

## Monitoring Database Activity

### 1. Database Overview
- Expand your server connection in the left panel
- Expand "Databases" → "aghamazing_db"
- You'll see multiple schemas:
  - `public`: Contains your application tables
  - `information_schema`: System metadata
  - `pg_catalog`: PostgreSQL system catalog

### 2. Browse Tables and Data
- Expand "Schemas" → "public" → "Tables"
- Right-click any table and select "View/Edit Data" → "All Rows"
- This allows you to inspect the actual data stored by your application

### 3. Execute Queries
- Right-click on the database name and select "Query Tool"
- Write SQL queries to analyze your data:

```sql
-- Count content items by status
SELECT status, COUNT(*) 
FROM contentmanagement_contentitem 
GROUP BY status;

-- Find recently created content
SELECT title, created_at, status 
FROM contentmanagement_contentitem 
ORDER BY created_at DESC 
LIMIT 10;

-- View user activity
SELECT username, last_login, date_joined 
FROM auth_user 
ORDER BY date_joined DESC;
```

### 4. Monitor Live Activity
- Go to "Tools" → "Activity" → "Dashboard"
- View current connections, running queries, and server status
- Use "Running Queries" to see what operations are currently happening

## Backend API Connection Flow

The connection flow between your frontend, backend, and PostgreSQL is as follows:

1. **Frontend (React)** makes API calls to:
   - `http://127.0.0.1:8000/api/auth/` - Authentication endpoints
   - `http://127.0.0.1:8000/api/content/` - Content management endpoints
   - `http://127.0.0.1:8000/api/users/` - User management endpoints

2. **Backend (Django/Wagtail)** receives these requests and:
   - Authenticates users via JWT tokens
   - Validates data and permissions
   - Performs CRUD operations on PostgreSQL tables
   - Returns JSON responses to the frontend

3. **PostgreSQL** stores all:
   - User accounts and sessions
   - Content items and pages
   - Authentication tokens
   - Audit logs and analytics
   - File metadata (actual files are stored in the filesystem)

## Monitoring Best Practices

### Regular Checks
1. **Disk Space**: Monitor database size under the database properties
2. **Connection Count**: Check active connections via Activity → Connections
3. **Slow Queries**: Use the Query Tool to identify performance bottlenecks
4. **Data Integrity**: Regularly verify foreign key relationships

### Performance Monitoring
- Use "Statistics" → "Dashboard" for server metrics
- Monitor table bloat under "Tools" → "Maintenance" → "Analyze"
- Check index usage efficiency

### Security Monitoring
- Review user permissions regularly
- Monitor access logs for unusual activity
- Ensure sensitive data is properly encrypted

## Troubleshooting Common Issues

### Cannot Connect to Database
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check the port in `/etc/postgresql/*/main/postgresql.conf`
- Confirm credentials in your Django settings

### Slow Application Performance
- Identify slow queries using the Query Tool
- Check if indexes exist on frequently queried columns
- Monitor server resources (CPU, memory, disk I/O)

### Missing Data
- Verify Django migrations are applied: `python manage.py showmigrations`
- Check table permissions in pgAdmin4
- Review application logs for errors

Your Django/Wagtail backend is fully connected to PostgreSQL, and your React frontend communicates with the backend via API calls. All data flows through PostgreSQL, which you can monitor comprehensively using pgAdmin4.