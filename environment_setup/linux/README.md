# Linux Environment Setup for AGHAMazingQuestCMS

This guide provides instructions for setting up the AGHAMazingQuestCMS development environment specifically for Linux systems.

## Prerequisites

- Python 3.11
- Node.js and npm
- Git

## Setup Options

We provide multiple options for setting up the environment:

### Option 1: Full Automated Setup (Recommended)

Run the complete setup script that handles everything:

```bash
# Make the script executable and run it
chmod +x environment_setup/linux/full-setup.sh
./environment_setup/linux/full-setup.sh
```

### Option 2: Two-Step Setup

1. Install system dependencies:
```bash
chmod +x environment_setup/linux/install-dependencies.sh
./environment_setup/linux/install-dependencies.sh
```

2. Then run the project setup:
```bash
chmod +x environment_setup/linux/setup.sh
./environment_setup/linux/setup.sh
```

### Option 3: Manual Setup

If you prefer to set up manually, follow the detailed steps below.

## Detailed Manual Setup

If you prefer to set up the environment manually:

### 1. Install Python 3.11 and required packages

```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3.11-dev
```

### 2. Create and activate virtual environment:

```bash
python3.11 -m venv venv
source venv/bin/activate
```

### 3. Install Python dependencies:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install python-dotenv
```

### 4. Set up environment variables:

```bash
cp .env.example .env
# Edit .env file as needed
```

### 5. Run database migrations:

```bash
python manage.py migrate
```

### 6. Create a superuser account:

```bash
export DJANGO_SUPERUSER_PASSWORD="admin123"
python manage.py createsuperuser --username admin --email admin@example.com --noinput
unset DJANGO_SUPERUSER_PASSWORD
```

### 7. Create required roles:

```bash
python manage.py create_content_roles
```

### 8. Collect static files:

```bash
python manage.py collectstatic --noinput
```

### 9. Start the Django development server:

```bash
python manage.py runserver 8000
```

### 10. Install and start the React frontend:

```bash
cd frontend
npm install
npm start
```


## Accessing the Application

- **Frontend**: Open `http://localhost:3000` in your browser
- **Django Admin**: Open `http://127.0.0.1:8000/admin/` and log in with your superuser credentials
- **Wagtail Admin**: Open `http://127.0.0.1:8000/wagtail/` and log in with your superuser credentials

## Default Credentials

- **Username**: admin
- **Password**: admin123

## Troubleshooting

### Common Issues:

1. **Permission Denied Error**:
   - Make sure the `docker/entrypoint.sh` script has executable permissions:
     ```bash
     chmod +x docker/entrypoint.sh
     ```

2. **Python Dependencies**:
   - If you encounter errors during dependency installation, make sure you have the latest pip:
     ```bash
     python -m pip install --upgrade pip
     ```

3. **Database Connection Error**:
   - Ensure your database is running and credentials in `.env` are correct.
   - For development, SQLite is used by default when `DEBUG=True`.

4. **Node.js Version**:
   - Make sure you're using a compatible Node.js version (the project typically works with LTS versions).

### Changing Database Settings

By default, the project uses SQLite for development (when `DEBUG=True`). If you want to use PostgreSQL or MySQL:

1. Update the `.env` file with your database settings
2. Install the required driver (`pip install psycopg2-binary` for PostgreSQL, `pip install PyMySQL` for MySQL)

Example for PostgreSQL:
```bash
DB_ENGINE=postgres
DB_NAME=aghamazingquestcms
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
```

Example for MySQL:
```bash
DB_ENGINE=mysql
DB_NAME=aghamazingquestcms
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

## Docker Setup (Alternative Method)

If you prefer to use Docker:

```bash
# Make sure Docker and Docker Compose are installed
# Copy .env.example to .env and adjust settings if needed
cp .env.example .env

# Build and run the services
docker-compose up --build
```

## Project Structure

- `apps/` - Django applications for authentication, content management, user management, and analytics
- `config/` - Django settings and configuration
- `frontend/` - React frontend application
- `staticfiles/` - Collected static files
- `media/` - User-uploaded media files
- `environment_setup/` - Platform-specific setup scripts and documentation
  - `linux/` - Linux-specific setup scripts and documentation

## Additional Management Commands

- `python manage.py create_content_roles` - Creates the required user groups and permissions
- `python manage.py check` - Runs system checks
- `python manage.py shell` - Opens Django shell for debugging
- `python manage.py runserver 0.0.0.0:8000` - Runs server accessible from other machines