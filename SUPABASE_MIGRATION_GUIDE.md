# Supabase Migration Guide for AGHAMazingQuestCMS

This document outlines the steps required to migrate your database from a local PostgreSQL instance to Supabase.

## Prerequisites

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com) and sign up for an account
   - Create a new project in your Supabase dashboard

2. **Get Your Connection Details**
   - From your project dashboard, go to "Settings" → "Database"
   - Note down your connection details:
     - Hostname
     - Database name
     - Username
     - Password

## Pre-Migration Steps

1. **Backup Current Data (Optional but Recommended)**
   ```bash
   # If PostgreSQL is installed locally
   pg_dump -h localhost -U admin -d aghamazingquestcms > backup.sql
   ```

2. **Update Environment Configuration**
   - Update your `.env` file with your Supabase connection details
   
3. **Install Required Dependencies**
   ```bash
   cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS
   source venv/bin/activate
   pip install psycopg2-binary python-dotenv
   ```

## Migration Process

### Option 1: Using the Migration Script (Recommended)

1. **Prepare your environment:**
   ```bash
   cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS
   source venv/bin/activate
   ```

2. **Update your .env file with Supabase details:**
   ```bash
   # Edit the .env file to include your Supabase connection details
   nano .env
   ```

3. **Run the migration script:**
   ```bash
   python scripts/migrate_to_supabase.py
   ```

### Option 2: Manual Migration

1. **Update your environment variables** to point to Supabase in `.env`:
   ```bash
   DB_ENGINE=postgres
   DB_NAME=your_supabase_db_name
   DB_USER=your_supabase_username
   DB_PASSWORD=your_supabase_password
   DB_HOST=your-project-name.supabase.co
   DB_PORT=5432
   ```

2. **Run Django migrations:**
   ```bash
   cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS
   source venv/bin/activate
   python manage.py migrate
   ```

3. **Collect static files:**
   ```bash
   python manage.py collectstatic --noinput
   ```

4. **Create a superuser (if needed):**
   ```bash
   python manage.py createsuperuser
   ```

## Post-Migration Verification

1. **Test the application:**
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
   
2. **Verify database connectivity:**
   - Visit the admin panel at `http://localhost:8000/admin/`
   - Try creating, editing, and deleting content items
   - Check that all functionality works as expected

## Migration Rollback Plan

If you encounter issues and need to revert to your local database:

1. **Restore your original .env file:**
   ```bash
   cp .env.backup.before.supabase .env
   ```

2. **Restart your local PostgreSQL service if needed:**
   ```bash
   sudo systemctl start postgresql
   ```

## Additional Supabase Features to Consider

Once your migration is successful, consider implementing these Supabase features:

1. **Authentication**: Replace the current Django/Wagtail auth system with Supabase Auth for enhanced features
2. **Realtime**: Implement real-time updates for content collaboration
3. **Storage**: Use Supabase Storage for managing media files
4. **Edge Functions**: Deploy serverless functions for custom logic

## Troubleshooting

### Connection Issues
- Verify your firewall settings allow outbound connections to Supabase
- Confirm your connection string details are correct
- Ensure SSL is enabled (Supabase requires SSL)

### Migration Errors
- Check that your Supabase database has enough space
- Verify that your database user has the necessary permissions
- Ensure that your connection pool size is appropriate

### Performance Considerations
- Network latency may be higher when connecting to a cloud database
- Consider implementing caching layers if needed
- Monitor query performance and optimize as needed

## Security Considerations

- Store your Supabase credentials securely and never commit them to version control
- Regularly rotate your database passwords
- Limit database user permissions to the minimum required
- Enable Row Level Security (RLS) in Supabase if needed for fine-grained access control

## Support

If you encounter any issues during the migration process, please contact the Supabase support team or refer to the documentation.