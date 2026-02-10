#!/bin/sh
set -e

# Default behavior: run passed command
# If no command provided, start Gunicorn
if [ "$#" -eq 0 ]; then
  exec gunicorn config.wsgi:application --bind 0.0.0.0:8000
else
  exec "$@"
fi
