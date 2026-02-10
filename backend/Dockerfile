FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
# When build context is repository root, the backend requirements live at `backend/requirements.txt`.
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code from backend directory into image root (/app).
# Build context is repository root, so copy the backend folder contents into /app.
COPY backend/ /app/

# Create a dedicated user for the application
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Run migrations and collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run the application with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]