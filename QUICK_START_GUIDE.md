# AGHAMazingQuestCMS - Quick Start Guide

This guide provides a quick reference for starting the development environment daily.

## Daily Development Workflow

### Terminal 1 - Backend Server
```bash
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend
source venv/bin/activate
python manage.py runserver 8001
```

### Terminal 2 - Frontend Server
```bash
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/frontend
npm start
```

## One-Time Setup (if not already done)

Run the setup script to prepare your environment:

```bash
cd /home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS
./setup_full_stack.sh
```

## Useful Commands

### Backend Management
- Run tests: `cd backend && source venv/bin/activate && python manage.py test`
- Create migrations: `cd backend && source venv/bin/activate && python manage.py makemigrations`
- Apply migrations: `cd backend && source venv/bin/activate && python manage.py migrate`
- Access Django shell: `cd backend && source venv/bin/activate && python manage.py shell`
- Create superuser: `cd backend && source venv/bin/activate && python manage.py createsuperuser`

### Frontend Management
- Run tests: `cd frontend && npm test`
- Create production build: `cd frontend && npm run build`
- Run linter: `cd frontend && npm run lint`

## API Access Points

When both servers are running:

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8001/api/](http://localhost:8001/api/)
- **API Documentation (Swagger)**: [http://localhost:8001/api/swagger/](http://localhost:8001/api/swagger/)
- **Django Admin Panel**: [http://localhost:8001/admin/](http://localhost:8001/admin/)

## Troubleshooting Quick Fixes

### Frontend Can't Connect to Backend
- Verify backend is running on port 8001
- Check that `REACT_APP_BACKEND_API_URL` in `frontend/.env` is set to `http://localhost:8001`

### Backend Port Already in Use
- Try a different port: `python manage.py runserver 8002`
- Update frontend `.env` file accordingly: `REACT_APP_BACKEND_API_URL=http://localhost:8002`

### Frontend Port Already in Use
- React will typically offer to run on the next available port automatically