# Full Stack API Documentation

## Available API Endpoints

### Authentication APIs (`/api/auth/`)
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Obtain JWT token pair
- `POST /api/auth/refresh/` - Refresh JWT token
- `GET /api/auth/me/` - Get current user info

### Content Management APIs (`/api/content/`)
- `GET /api/content/items/` - List all content items
- `POST /api/content/items/` - Create a new content item
- `GET /api/content/items/{id}/` - Retrieve a specific content item
- `PUT /api/content/items/{id}/` - Update a content item
- `PATCH /api/content/items/{id}/` - Partially update a content item
- `DELETE /api/content/items/{id}/` - Soft delete a content item

#### Content Workflow Actions:
- `POST /api/content/items/{id}/send_for_approval/` - Send content for approval
- `POST /api/content/items/{id}/approve/` - Approve content
- `POST /api/content/items/{id}/deny/` - Deny content
- `POST /api/content/items/{id}/publish/` - Publish content

#### Content Pages:
- `GET /api/content/pages/` - List all content pages
- `POST /api/content/pages/` - Create a new content page
- `GET /api/content/pages/{id}/` - Retrieve a specific content page
- `PUT /api/content/pages/{id}/` - Update a content page
- `PATCH /api/content/pages/{id}/` - Partially update a content page
- `DELETE /api/content/pages/{id}/` - Delete a content page
- `POST /api/content/pages/{id}/approve/` - Approve content page
- `POST /api/content/pages/{id}/reject/` - Reject content page
- `POST /api/content/pages/{id}/publish/` - Publish content page
- `GET /api/content/pages/{id}/version_history/` - Get version history

#### Game Content:
- `GET /api/content/game/content/` - Get published content for games

### User Management APIs (`/api/users/`)
- `GET /api/users/` - List all users
- `POST /api/users/` - Create a new user
- `GET /api/users/{id}/` - Retrieve a specific user
- `PUT /api/users/{id}/` - Update a user
- `PATCH /api/users/{id}/` - Partially update a user
- `DELETE /api/users/{id}/` - Delete a user
- `GET /api/users/dashboard/stats/` - Get dashboard stats
- `GET /api/users/content/recent/` - Get recently created content

#### User Roles:
- `GET /api/users/roles/` - List all roles
- `POST /api/users/roles/create/` - Create a new role
- `GET /api/users/roles/{id}/` - Get specific role details
- `PUT /api/users/roles/{id}/` - Update a role
- `DELETE /api/users/roles/{id}/` - Delete a role

### Analytics APIs (`/api/analytics/`)
- `GET /api/analytics/` - Get analytics summary
- `GET /api/analytics/summary/` - Get detailed analytics summary
- `GET /api/analytics/content/` - Get content analytics
- `GET /api/analytics/users/` - Get user activity analytics
- `POST /api/analytics/generate/` - Generate analytics report
- `POST /api/analytics/download/` - Download analytics report

### Wagtail CMS (`/cms/`)
- `GET /cms/` - Access Wagtail CMS frontend

### Django Admin (`/admin/`)
- `GET /admin/` - Access Django admin panel

## Full Stack Configuration

### Backend Settings
- Host: `http://localhost:8000`
- Database: PostgreSQL at `172.17.0.1:5439`
- Database name: `aghamazing_db`
- Database user: `admin`
- Database password: `password123`

### Frontend Settings
- Host: `http://localhost:3000`
- API Base URL: `http://localhost:8000/api`
- Environment Variable: `REACT_APP_BACKEND_API_URL=http://localhost:8000/api`

### Secret Key Configuration
The Django secret key has been set in the `.env` file in the backend directory.