"""
Supabase configuration for the AGHAMazingQuestCMS project.

This configuration connects the Django backend to Supabase PostgreSQL database
and potentially integrates with Supabase Auth for authentication.
"""

from .base import *

import os
import dj_database_url  # This will need to be installed

# Supabase Database Configuration
SUPABASE_DB_URL = os.environ.get('SUPABASE_DB_URL')
if SUPABASE_DB_URL:
    DATABASES = {
        'default': dj_database_url.config(default=SUPABASE_DB_URL, conn_max_age=600, ssl_require=True)
    }
else:
    # Fallback to environment variables
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('SUPABASE_DB_NAME'),
            'USER': os.environ.get('SUPABASE_DB_USER'),
            'PASSWORD': os.environ.get('SUPABASE_DB_PASSWORD'),
            'HOST': os.environ.get('SUPABASE_DB_HOST'),
            'PORT': os.environ.get('SUPABASE_DB_PORT', '5432'),
            'OPTIONS': {
                'sslmode': 'require',
            },
        }
    }

# Supabase Auth Integration
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://your-project.supabase.co')

# If using Supabase Auth, you might want to configure it as an alternative to Django's built-in auth
# This would require additional configuration for the frontend to interact with Supabase Auth directly

# Update CORS settings to include Supabase Studio if needed
if 'corsheaders.middleware.CorsMiddleware' in MIDDLEWARE:
    CORS_ALLOWED_ORIGINS.extend([
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        SUPABASE_URL,  # Add Supabase URL to allowed origins if needed
    ])

# Optional: Configure Supabase Realtime if needed
SUPABASE_REALTIME = {
    'ENABLED': os.environ.get('SUPABASE_REALTIME_ENABLED', 'False').lower() == 'true',
    'URL': f"wss://{os.environ.get('SUPABASE_PROJECT_REF')}.supabase.co/realtime/v1/websocket"
}