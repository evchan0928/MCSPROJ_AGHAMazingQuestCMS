"""
Local development settings that override base.py to use SQLite instead of PostgreSQL
"""
from .base import *

# Use SQLite for local development without Docker
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Ensure debug is enabled for development
DEBUG = True

print("Using local SQLite database for development.")