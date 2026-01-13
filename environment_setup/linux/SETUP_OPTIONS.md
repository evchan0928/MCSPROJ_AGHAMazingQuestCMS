# Linux Setup Options for AGHAMazingQuestCMS

This document outlines the various setup options available for running AGHAMazingQuestCMS on Linux systems.

## Available Scripts

### 1. install-dependencies.sh
Installs all system-level dependencies required for the project:

```bash
./environment_setup/linux/install-dependencies.sh
```

This script installs:
- Python 3.11 and development tools
- Node.js and npm
- System dependencies for Python packages
- Other required tools

### 2. setup.sh
Sets up the Python virtual environment and project:

```bash
./environment_setup/linux/setup.sh
```

This script:
- Creates and activates a Python virtual environment
- Installs Python dependencies
- Configures environment variables
- Runs database migrations
- Creates a superuser account
- Sets up content roles
- Collects static files

### 3. full-setup.sh
Complete setup that combines both dependency installation and project setup:

```bash
./environment_setup/linux/full-setup.sh
```

This script runs both of the above processes in sequence.

## Step-by-Step Process

If you prefer to set up manually, here are the individual steps:

### 1. Install System Dependencies
```bash
sudo apt update
sudo apt install -y python3.11 python3.11-dev python3.11-venv python3-pip
sudo apt install -y build-essential libpq-dev gcc curl
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Create Virtual Environment
```bash
python3.11 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install python-dotenv
```

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env file as needed
chmod +x docker/entrypoint.sh
```

### 5. Run Setup Commands
```bash
python manage.py migrate
export DJANGO_SUPERUSER_PASSWORD="admin123"
python manage.py createsuperuser --username admin --email admin@example.com --noinput
unset DJANGO_SUPERUSER_PASSWORD
python manage.py create_content_roles
python manage.py collectstatic --noinput
```

### 6. Install Frontend Dependencies
```bash
cd frontend
npm install
```

## Running the Application

### Backend (Django/Wagtail):
```bash
source venv/bin/activate
cd /path/to/MCSPROJ_AGHAMazingQuestCMS
python manage.py runserver 8000
```

### Frontend (React):
```bash
cd /path/to/MCSPROJ_AGHAMazingQuestCMS/frontend
npm start
```

## Docker Alternative

If you prefer using Docker, you can build and run with:

```bash
# Build and run with docker-compose
docker-compose up --build
```

Or build the Docker image directly:
```bash
docker build -t aghamazingquestcms .
docker run -p 8000:8000 aghamazingquestcms
```

## Important Notes

- All Windows-related files remain unchanged and unmodified
- The Linux-specific setup is contained entirely within the `environment_setup/linux/` directory
- You can safely run these scripts without affecting any Windows configuration
- The virtual environment approach ensures project dependencies are isolated