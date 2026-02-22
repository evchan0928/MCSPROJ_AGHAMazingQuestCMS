"""
Neon Serverless PostgreSQL configuration for the AGHAMazingQuestCMS project.
"""

from .base import *
import os
import dj_database_url

# Neon Database Configuration
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(default=DATABASE_URL, conn_max_age=600, ssl_require=True)
    }
else:
    # Fallback to environment variables for Neon connection
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('NEON_DB_NAME', os.environ.get('DB_NAME')),
            'USER': os.environ.get('NEON_DB_USER', os.environ.get('DB_USER')),
            'PASSWORD': os.environ.get('NEON_DB_PASSWORD', os.environ.get('DB_PASSWORD')),
            'HOST': os.environ.get('NEON_DB_HOST', os.environ.get('DB_HOST')),
            'PORT': os.environ.get('NEON_DB_PORT', os.environ.get('DB_PORT', '5432')),
            'OPTIONS': {
                'sslmode': 'require',
                # TCP keepalive settings for stable connections to Neon
                'keepalives': 1,
                'keepalives_idle': 30,
                'keepalives_interval': 10,
                'keepalives_count': 5,
            },
        }
    }

# Ensure SSL is required for Neon
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')