# AGHAMazingQuestCMS

AGHAMazingQuestCMS is a content management system for the AGHAMazing Quest AR-guided tour application, developed for the Department of Science and Technology - Science Education Institute (DOST-SEI) in the Philippines.

## Project Structure

```
AGHAMazingQuestCMS/
├── backend/                  # Django REST API backend
│   ├── apps/                 # Django applications
│   │   ├── authentication/
│   │   ├── contentmanagement/
│   │   ├── usermanagement/
│   │   └── analyticsmanagement/
│   ├── config/               # Django configuration
│   └── manage.py
├── frontend/                 # React frontend application
├── docs/                     # Documentation
├── aghamazingflutter-master/ # Flutter mobile application
├── setup_full_stack.sh       # Full stack setup script
├── stop_services.sh          # Service stop script
├── .env                     # Environment variables
└── requirements.txt         # Python dependencies
```

## Prerequisites

- Python 3.9+
- Node.js 16+
- npm
- Git
- PostgreSQL (or access to Neon Serverless PostgreSQL)

## Setup Instructions

### Quick Setup (Recommended)

1. Make the setup script executable:
   ```bash
   chmod +x setup_full_stack.sh
   ```

2. Run the full stack setup:
   ```bash
   ./setup_full_stack.sh
   ```

This will:
- Check all prerequisites
- Set up the backend with virtual environment
- Install all dependencies
- Run database migrations
- Start the backend server on port 8000
- Set up and start the frontend server on port 3000 (if available)

### Manual Setup

#### Backend Setup

1. Create a virtual environment:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r ../requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp ../.env.example .env
   # Edit .env with your specific configuration
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Services

- **Backend API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/api/`
- **Admin Panel**: `http://localhost:8000/admin/`
- **Frontend**: `http://localhost:3000`

## Stopping Services

To stop all running services:

```bash
./stop_services.sh
```

## Configuration

The application uses environment variables for configuration. Copy `.env.example` to `.env` and customize as needed.

For Neon Serverless PostgreSQL, ensure your `.env` contains the correct `DATABASE_URL`:
```
DATABASE_URL='postgresql://username:password@ep-xxxxxxx.region.aws.neon.tech/dbname?sslmode=require'
```

## API Documentation

The API is documented using Swagger and is available at `http://localhost:8000/api/` when the backend is running.

## Development

For development, we follow these principles:

1. **Modular Architecture**: Each major feature is contained in its own Django app
2. **Security First**: All API endpoints are protected by authentication
3. **Clean Code**: Follow PEP 8 for Python and ESLint standards for JavaScript
4. **Documentation**: APIs are documented using Swagger

## Deployment

For production deployment, please refer to the documentation in the `docs/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request