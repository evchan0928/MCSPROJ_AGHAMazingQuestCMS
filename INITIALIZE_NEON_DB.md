# Neon Database Initialization Guide

Due to the error encountered, your Neon database needs proper permissions to run Django migrations. Here's how to resolve this:

## Solution 1: Grant Schema Permissions via Neon Console

1. Go to your Neon Console: https://console.neon.tech/
2. Navigate to your project: broad-cherry-66861522
3. Click on the SQL Editor tab
4. Execute the following commands:

```sql
-- Grant necessary permissions to your database user
GRANT CREATE ON SCHEMA public TO neondb_owner;
GRANT USAGE ON SCHEMA public TO neondb_owner;

-- If needed, grant all privileges
GRANT ALL PRIVILEGES ON SCHEMA public TO neondb_owner;

-- To grant permissions to future tables in the schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO neondb_owner;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO neondb_owner;
```

## Solution 2: Alternative Connection Method

If the pooler endpoint doesn't work well for DDL operations, try switching to the non-pooler endpoint in your .env file:

Change from:
```
DATABASE_URL='postgresql://neondb_owner:npg_MBd91WOvLonZ@ep-withered-pond-a10vxojs-pooler.ap-southeast-1.aws.neon.tech/AGHAMazingQuestCMS?sslmode=require&channel_binding=require'
```

To (remove `-pooler`):
```
DATABASE_URL='postgresql://neondb_owner:npg_MBd91WOvLonZ@ep-withered-pond-a10vxojs.ap-southeast-1.aws.neon.tech/AGHAMazingQuestCMS?sslmode=require&channel_binding=require'
```

## Running Migrations After Permission Fix

Once you've granted the permissions, run the following commands:

```bash
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS

# Source environment variables
export $(grep -v '^#' .env | xargs)

# Activate virtual environment
source /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/venv/bin/activate

# Run Django migrations
python3 backend/manage.py migrate

# Create a superuser (optional but recommended)
python3 backend/manage.py createsuperuser
```

## Verification

After running migrations, verify everything works:

```bash
python3 backend/manage.py showmigrations
```

All migrations should show `[X]` indicating they've been applied.

## Creating a Superuser (Optional)

If you need to access the Django admin panel:

```bash
python3 backend/manage.py createsuperuser
```

Follow the prompts to create an admin account.