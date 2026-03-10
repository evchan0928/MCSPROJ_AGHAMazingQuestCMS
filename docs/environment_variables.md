# Environment Files Documentation

## Purpose of Each File

- `.env` - Main environment configuration for the current installation
- `.env.example` - Template showing required variables for new installations
- `.env.local` - Local overrides for development (typically in .gitignore)

## Recommended Structure
```
# .env - Production/Development configuration
POSTGRES_DB=aghamazing_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
# ... other production variables

# .env.example - Template for new installations
POSTGRES_DB=appdb
POSTGRES_USER=appuser
POSTGRES_PASSWORD=password
# ... template variables

# .env.local - Local development overrides
POSTGRES_DB=local_aghamazing_db
POSTGRES_USER=local_user
POSTGRES_PASSWORD=local_password
# ... local overrides
```