#!/usr/bin/env bash
set -e

# Run database migrations, collect static files, then start Gunicorn.
# This script assumes environment variables are provided via an .env file
# mounted or passed to the container.

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
