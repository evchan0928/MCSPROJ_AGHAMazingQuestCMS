# Supabase Integration for AGHAMazingQuestCMS

This document describes how to set up and use Supabase with the AGHAMazingQuestCMS project.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A Supabase project created in the Supabase dashboard
3. Your project's URL and API keys

## Configuration

### Backend Configuration

1. Set the following environment variables in your `.env` file or deployment environment:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://[user]:[password]@[host]:[port]/[database]
```

2. Update your Django settings to use the Supabase configuration:

```python
# In your settings file
from .supabase import *
```

3. Add the Supabase middleware to your `MIDDLEWARE` setting in `settings.py`:

```python
MIDDLEWARE = [
    # ... other middleware
    'middleware.supabase_auth.SupabaseAuthMiddleware',
    # ... rest of middleware
]
```

### Frontend Configuration

1. Set the following environment variables in your frontend `.env` file:

```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

2. The frontend will automatically use Supabase when these variables are set.

## Using Supabase in the Backend

### Database Operations

```python
from utils.supabase_client import get_supabase_service

# Get the Supabase client
supabase = get_supabase_service().get_client()

# Perform operations
data, count = supabase.table('your_table').select('*').execute()
```

### Authentication

```python
from utils.supabase_client import get_supabase_service

service = get_supabase_service()
user = service.authenticate_user(email, password)
```

## Using Supabase in the Frontend

### Authentication

```javascript
import { signInWithEmail, signOut, getCurrentUser } from './api/supabase-api';

// Sign in
await signInWithEmail(email, password);

// Get current user
const user = await getCurrentUser();

// Sign out
await signOut();
```

### Database Operations

```javascript
import { fetchDataFromTable, insertIntoTable } from './api/supabase-api';

// Fetch data
const data = await fetchDataFromTable('your_table');

// Insert data
await insertIntoTable('your_table', { column1: 'value1', column2: 'value2' });
```

## Migration Strategy

If you're migrating from the existing Django database to Supabase:

1. Export your current data using Django management commands
2. Import the data into your Supabase tables
3. Update your models to use Supabase as the primary data source
4. Test thoroughly to ensure all functionality works

## Switching Between Backends

The application is designed to work with both the traditional Django backend and Supabase. You can switch between them by configuring environment variables:

- When Supabase environment variables are set, Supabase will be used
- When they're not set, the traditional Django backend will be used

## Testing

To test the Supabase integration:

1. Run the development servers as usual:

```bash
# Start both backend and frontend
./scripts/run_both.sh
```

2. Access the application at `http://localhost:3000`

3. Try signing in and performing operations to ensure everything works correctly with Supabase