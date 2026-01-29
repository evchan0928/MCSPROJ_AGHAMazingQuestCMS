# Setting Up PostgreSQL and pgAdmin4 for AGHAMazingQuestCMS

This guide explains how to set up PostgreSQL as the primary database for your Django/Wagtail application and configure pgAdmin4 as your database management platform.

## Step 1: Install PostgreSQL Server

### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### On CentOS/RHEL/Fedora:
```bash
# For CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb

# For Fedora
sudo dnf install postgresql-server postgresql-contrib
sudo postgresql-setup --initdb --unit postgresql
```

### On Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the postgres user

## Step 2: Configure PostgreSQL

1. Switch to the postgres user and access PostgreSQL:
```bash
sudo -u postgres psql
```

2. Create a database and user for your application:
```sql
CREATE DATABASE aghamazing_db;
CREATE USER postgres WITH PASSWORD 'admin123';
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
ALTER ROLE postgres SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE aghamazing_db TO postgres;
\q
```

## Step 3: Update Environment Variables

Update your `.env` file with PostgreSQL connection details:

```env
# Database configuration
DB_ENGINE=postgres
DB_NAME=aghamazing_db
DB_USER=postgres
DB_PASSWORD=admin123
DB_HOST=localhost
DB_PORT=5432

# Django settings
DJANGO_SECRET_KEY=your_secure_secret_key_here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
```

## Step 4: Install pgAdmin4

### On Ubuntu/Debian:
```bash
sudo apt install pgadmin4
sudo /usr/pgadmin4/bin/setup-web.sh
```

### On CentOS/RHEL:
```bash
sudo yum install pgadmin4
sudo /usr/pgadmin4/bin/setup-web.sh
```

### On Windows:
Download from https://www.pgadmin.org/download/pgadmin-4-windows/ and run the installer.

## Step 5: Configure pgAdmin4

1. Access pgAdmin4 via web browser at `http://localhost/pgadmin4` or open the desktop application
2. Set up your login credentials
3. Right-click "Servers" > "Create" > "Server"
4. In the "General" tab, give the server a name (e.g., "AGHAMazingQuestCMS")
5. In the "Connection" tab:
   - Host name/address: `localhost`
   - Port: `5432`
   - Maintenance database: `aghamazing_db`
   - Username: `postgres`
   - Password: `admin123`

## Step 6: Install Required Python Dependencies

```bash
# Activate your virtual environment
source venv/bin/activate

# Install/update dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

## Step 7: Run Database Migrations

```bash
# Activate your virtual environment
source venv/bin/activate

# Apply database migrations to PostgreSQL
export DB_ENGINE=postgres
python manage.py makemigrations
python manage.py migrate

# Create a superuser account
python manage.py createsuperuser
```

## Step 8: Verify Database Connection

You can verify that your application connects to PostgreSQL by:

1. Checking the Django admin interface works
2. Looking at the pgAdmin4 dashboard to see active connections
3. Running a simple test in the Django shell:
```bash
python manage.py shell
```

Then run:
```python
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT version();")
print(cursor.fetchone())
```

## Step 9: Optimize PostgreSQL for Your Application

Optionally, you can optimize your PostgreSQL configuration by editing `postgresql.conf`:

1. Find the config file:
```bash
sudo -u postgres psql -c 'SHOW config_file;'
```

2. Common optimizations for Django applications:
```
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

Restart PostgreSQL after making changes:
```bash
sudo systemctl restart postgresql
```

## Step 10: Connect to Database Directly via pgAdmin4

1. In pgAdmin4, expand your server connection
2. Expand "Databases" and select "aghamazing_db"
3. Right-click and select "Query Tool"
4. You can now run SQL queries directly against your Django/Wagtail database
5. Navigate through Tables, Views, Functions, etc., to inspect your data

## Troubleshooting

### Connection Issues
- Verify PostgreSQL service is running: `sudo systemctl status postgresql`
- Check that PostgreSQL accepts connections on the configured port
- Verify user permissions and database existence
- Check firewall settings if connecting remotely

### Django Migration Errors
- Ensure the database exists and user has appropriate permissions
- Run migrations one by one to identify specific issues
- Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-*-main.log`

### pgAdmin4 Access Issues
- Web version: Ensure Apache/Nginx services are running
- Desktop version: Verify installation completed properly
- Check authentication settings

## Performance Monitoring with pgAdmin4

Once connected, pgAdmin4 provides many tools for monitoring:
- Query tool for custom SQL
- Statistics for database activity
- Dashboard showing server health
- Backup and restore utilities
- Data export/import capabilities

Your application is now configured to use PostgreSQL as the primary database with pgAdmin4 as the management platform. All Wagtail CMS functionality, user management, content management, and analytics will be stored in and managed through PostgreSQL.