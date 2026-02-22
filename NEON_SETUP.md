# Neon Serverless PostgreSQL Setup Guide

This guide explains how to configure your AGHAMazingQuestCMS project to work with Neon Serverless PostgreSQL.

## Prerequisites

1. A Neon account (sign up at [neon.tech](https://neon.tech))
2. A Neon project created in your dashboard
3. Access to your Neon connection details (host, username, password)

## Configuration Steps

### 1. Create a Neon Project

1. Go to your [Neon Console](https://console.neon.tech/app/projects)
2. Click "New Project"
3. Optionally, give your project a name (e.g., `aghamazingquestcms`)
4. Click "Create Project"

### 2. Get Connection Details

1. In your Neon project dashboard, locate the **Connection string** information
2. Look for a string similar to: `postgresql://username:password@ep-xxxxxxx.region.aws.neon.tech:5432/neondb`
3. From this connection string, extract the following details:
   - **Host** (e.g., `ep-xxxxxxx.region.aws-neon.tech`)
   - **Database name** (after the `/` - usually `neondb`)
   - **Username** (before the `:`)
   - **Password** (between `:` and `@`)
   
   **Important**: The API endpoint you may see (like `https://ep-xxxxxxx.apirest.region.aws.neon.tech/...`) is NOT the same as the database connection string. You need the PostgreSQL connection string, not the REST API endpoint.

### 3. Update Environment Variables

Update your [.env](file:///home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/.env) file with your Neon credentials:

```bash
# Neon Database configuration
NEON_DB_NAME=your_neon_database_name
NEON_DB_USER=your_neon_username
NEON_DB_PASSWORD=your_neon_password
NEON_DB_HOST=your-project.region.aws-neon.tech
NEON_DB_PORT=5432

# Keep fallback local database configuration
DB_NAME=aghamazing_local_db
DB_USER=admin
DB_PASSWORD=password123
DB_HOST=localhost
DB_PORT=5432
```

### 4. Run Migrations

After configuring your Neon credentials, run the following commands to apply schema and table migrations:

```bash
cd backend
source ../venv/bin/activate  # Activate your virtual environment
python manage.py makemigrations
python manage.py migrate
```

### 5. Verify Connection

To verify that your application is properly connected to Neon:

```bash
python manage.py dbshell
```

Then run:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
\q
```

## Troubleshooting

### Connection Issues

1. **Verify Port**: Ensure you're using port 5432 (not 5433) for Neon connections
2. **SSL Requirement**: Neon requires SSL connections (`sslmode=require`)
3. **Firewall**: Check if your Neon project allows connections from your IP

### Migration Verification

To confirm all migrations have been applied:

```bash
python manage.py showmigrations
```

All migrations should show `[X]` indicating they've been applied.

## Rollback Option

If you need to revert to a local database:

1. Comment out the NEON_DB_* variables in your [.env](file:///home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/.env) file
2. Make sure your local PostgreSQL service is running
3. Ensure your fallback DB_* variables point to your local installation
4. Restart your Django application

## Security Notes

- Never commit your [.env](file:///home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/.env) file to version control
- Use strong passwords for your Neon database
- Regularly rotate your database credentials
- Monitor connection logs in your Neon dashboard