"""
Docker PostgreSQL settings for local development.
This configuration connects to PostgreSQL running in a Docker container from the host machine.
"""
from .base import *

# Database configuration to connect to PostgreSQL in Docker container
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'aghamazing_db'),
        'USER': os.environ.get('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'admin'),
        'HOST': 'localhost',  # Connect to localhost instead of 'db' since we're running Django outside Docker
        'PORT': '5432',       # The port exposed by the Docker container
        'OPTIONS': {
            'connect_timeout': 10,
        },
    }
}

# Override CORS settings for local development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://0.0.0.0:3000",
    "http://0.0.0.0:8000",
    # Include the original Tailscale IPs
    "http://100.93.255.84:3000",
    "https://100.93.255.84:3000",
    "http://100.93.255.84:8000",
    "https://100.93.255.84:8000",
]

# Allow all origins during development
CORS_ALLOW_ALL_ORIGINS = True

# Make sure CSRF settings are properly configured
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000", 
    "http://127.0.0.1:8000",
    "http://0.0.0.0:3000",
    "http://0.0.0.0:8000",
    # Include the original Tailscale IPs
    "http://100.93.255.84:3000",
    "https://100.93.255.84:3000",
    "http://100.93.255.84:8000",
    "https://100.93.255.84:8000",
]

# Ensure debug is enabled for development
DEBUG = True

# Add proper middleware configuration as per Django Admin spec
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

print("Using Docker-hosted PostgreSQL database for development with proper CORS/CSRF configuration.")