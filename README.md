# AHA Amazing Quest CMS

A comprehensive Content Management System built with Django/Wagtail backend and React frontend.

## Project Structure

```
AGHA Amazing Quest CMS/
├── backend/                 # Django/Wagtail backend
│   ├── apps/               # Application modules
│   │   ├── analyticsmanagement/     # Analytics module
│   │   ├── authentication/          # Authentication module
│   │   ├── contentmanagement/       # Content management module
│   │   └── usermanagement/          # User management module
│   ├── config/             # Django settings and configurations
│   ├── middleware/         # Custom middleware components
│   ├── utils/              # Utility functions and helpers
│   ├── manage.py           # Django management script
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend application
│   ├── public/             # Public assets
│   ├── src/                # Source code
│   ├── package.json        # Node.js dependencies
│   └── README.md           # Frontend documentation
├── devops/                 # Deployment and containerization
│   ├── Dockerfile          # Backend Docker configuration
│   ├── docker-compose.yml  # Multi-container configuration
│   ├── deploy/             # Deployment scripts
│   └── docker/             # Additional docker resources
├── docs/                   # Documentation files
├── tests/                  # Test suite
└── scripts/                # Utility scripts
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend/
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Environment Variables

Both backend and frontend applications require environment variables to be configured properly. Check the `.env.example` files in each directory for required variables.

## Running Tests

Backend tests can be run with:
```bash
cd backend/
python manage.py test
```

Frontend tests can be run with:
```bash
cd frontend/
npm test
```

## Deployment

For deployment instructions, check the files under the [devops](file:///home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS/devops) directory.