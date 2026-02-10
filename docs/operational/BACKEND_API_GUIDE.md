# Backend API & Data Management Guide

## 🔌 REST API Overview

Your Django/Wagtail backend is now fully operational and ready to handle user authentication, content management, and data storage.

### Backend Information
- **API URL**: `http://100.93.255.84:8000`
- **Admin Panel**: `http://100.93.255.84:8000/admin`
- **API Framework**: Django REST Framework
- **CMS**: Wagtail
- **Database**: PostgreSQL (aghamazing_db)

---

## 🔐 Authentication

### Admin Credentials
```
Username: admin
Password: admin123456
Email: admin@aghamazing.com
```

### Getting Started with Admin Panel

1. **Access**: `http://100.93.255.84:8000/admin`
2. **Login** with credentials above
3. **Dashboard** appears with options to:
   - Manage Users
   - View Content
   - Configure Pages
   - Manage Permissions

---

## 👥 User Management via API

### Create Users Programmatically

**Via Django Shell**:
```bash
docker exec agha-backend python manage.py shell
```

```python
from django.contrib.auth import get_user_model
User = get_user_model()

# Create regular user
user = User.objects.create_user(
    username='john_doe',
    email='john@example.com',
    password='SecurePass123!',
    first_name='John',
    last_name='Doe'
)

# Create staff user (can access admin)
staff_user = User.objects.create_user(
    username='jane_admin',
    email='jane@example.com',
    password='AdminPass456!',
    is_staff=True
)

# Create superuser
super_user = User.objects.create_superuser(
    username='super_admin',
    email='super@example.com',
    password='SuperPass789!'
)
```

### REST API Endpoints

**User Registration** (if enabled):
```
POST /api/auth/register/
Content-Type: application/json

{
    "username": "newuser",
    "email": "user@example.com",
    "password": "SecurePassword123",
    "password_confirm": "SecurePassword123"
}
```

**User Login** (get authentication token):
```
POST /api/auth/login/
Content-Type: application/json

{
    "username": "admin",
    "password": "admin123456"
}

Response:
{
    "token": "abc123def456...",
    "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@aghamazing.com"
    }
}
```

**Get Current User Info**:
```
GET /api/auth/user/
Authorization: Token abc123def456...

Response:
{
    "id": 1,
    "username": "admin",
    "email": "admin@aghamazing.com",
    "first_name": "Admin",
    "last_name": "User",
    "is_staff": true,
    "is_superuser": true,
    "date_joined": "2026-02-10T03:00:00Z"
}
```

**Change User Password**:
```
POST /api/auth/change-password/
Authorization: Token abc123def456...
Content-Type: application/json

{
    "old_password": "admin123456",
    "new_password": "NewSecurePass789!"
}
```

---

## 📝 Content Management

### Create Content via API

**Create Content Item**:
```
POST /api/content/
Authorization: Token your_token_here
Content-Type: application/json

{
    "title": "Welcome to AGHAMazingQuest",
    "slug": "welcome-to-agha",
    "content": "This is the main content of the page.",
    "status": "published",
    "featured_image": 1,
    "ar_marker": "marker_qr_code",
    "chat_bot_allow": true
}
```

**Get All Content**:
```
GET /api/content/?status=published
Authorization: Token your_token_here
```

**Get Single Content**:
```
GET /api/content/{id}/
Authorization: Token your_token_here
```

**Update Content**:
```
PUT /api/content/{id}/
Authorization: Token your_token_here
Content-Type: application/json

{
    "title": "Updated Title",
    "content": "Updated content",
    "status": "published"
}
```

**Delete Content**:
```
DELETE /api/content/{id}/
Authorization: Token your_token_here
```

---

## 🖼️ Media Management

### Upload Images

**Upload Image**:
```
POST /api/images/
Authorization: Token your_token_here
Content-Type: multipart/form-data

file: [image file]
title: "My Image"
```

**Get Images**:
```
GET /api/images/
Authorization: Token your_token_here
```

**Image Properties**:
- Max file size: 10MB (configurable)
- Supported formats: JPG, PNG, GIF, WebP
- Auto-resizing for different screen sizes
- EXIF data handling

---

## 🎯 Permissions & Roles

### Django Permissions

Users have permissions for:
- `add_user` - Create new users
- `change_user` - Edit users
- `delete_user` - Remove users
- `add_content` - Create content
- `change_content` - Edit content
- `delete_content` - Remove content
- `publish_content` - Publish/unpublish
- `view_logs` - Access activity logs

### Assign Permissions

**Via Admin Panel**:
1. Go to: `http://100.93.255.84:8000/admin/auth/user/`
2. Click user → "Permissions"
3. Mark checkboxes for desired permissions
4. Click "Save"

**Via Django Shell**:
```python
from django.contrib.auth.models import Permission
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(username='john_doe')

# Get permission object
content_perm = Permission.objects.get(codename='add_contentitem')

# Add permission to user
user.user_permissions.add(content_perm)
user.save()

# Check if user has permission
if user.has_perm('contentmanagement.add_contentitem'):
    print("User can create content")
```

### User Roles (Custom)

**Create Custom Role**:
```python
from usermanagement.models import CustomUserRole

role = CustomUserRole.objects.create(
    user_id=user.id,
    role='editor'
)
```

**Available Roles**:
- `viewer` - Can only view published content
- `editor` - Can create and edit content
- `moderator` - Can moderate all content
- `admin` - Full access

---

## 📊 Data Validation

### Required Fields by Model

**ContentItem**:
- title (String, 255 chars)
- slug (String, 100 chars, unique)
- content (Text, unlimited)
- status (Choices: draft, published, archived)
- author (ForeignKey to User, required)

**Example: Validation on API Create**:
```json
{
    "title": "",  // ERROR: Required
    "content": "Some content"  // OK
}
```

Response:
```json
{
    "title": ["This field may not be blank."]
}
```

---

## 🔄 Real-time Data Sync

### WebSocket Support (Optional)

If WebSocket support is enabled:
```javascript
// Connect to WebSocket
ws = new WebSocket('ws://100.93.255.84:8000/ws/updates/');

ws.onmessage = function(event) {
    data = JSON.parse(event.data);
    console.log('New content:', data);
};

ws.onclose = function(event) {
    console.log('WebSocket closed');
};
```

### Long Polling Alternative

```javascript
// Poll for updates every 5 seconds
setInterval(() => {
    fetch('http://100.93.255.84:8000/api/content/')
        .then(response => response.json())
        .then(data => console.log(data));
}, 5000);
```

---

## 🔍 Search & Filtering

### Search Content by Title

```
GET /api/content/?search=welcome HTTPs/1.1
Authorization: Token your_token
```

### Filter by Status

```
GET /api/content/?status=published
Authorization: Token your_token
```

### Filter by Author

```
GET /api/content/?author=1
Authorization: Token your_token
```

### Combine Filters

```
GET /api/content/?status=published&search=tutorial&author=1
Authorization: Token your_token
```

---

## 📈 Pagination

### Paginate Results

```
GET /api/content/?page=1&page_size=20
Authorization: Token your_token
```

Response includes:
```json
{
    "count": 150,
    "next": "http://api.example.com/content/?page=2",
    "previous": null,
    "results": [ ... ]
}
```

---

## 🚀 Batch Operations

### Create Multiple Users

```python
from django.contrib.auth import get_user_model

User = get_user_model()

users_data = [
    {'username': 'user1', 'email': 'user1@example.com', 'password': 'Pass1'},
    {'username': 'user2', 'email': 'user2@example.com', 'password': 'Pass2'},
    {'username': 'user3', 'email': 'user3@example.com', 'password': 'Pass3'},
]

users = []
for user_data in users_data:
    password = user_data.pop('password')
    user = User(**user_data)
    user.set_password(password)
    users.append(user)

User.objects.bulk_create(users)
```

---

## 🧪 Testing API with cURL

### Test Login

```bash
curl -X POST http://100.93.255.84:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}'
```

### Get Content

```bash
TOKEN="your_token_from_login"
curl -X GET http://100.93.255.84:8000/api/content/ \
  -H "Authorization: Token $TOKEN"
```

### Create Content

```bash
TOKEN="your_token"
curl -X POST http://100.93.255.84:8000/api/content/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Article",
    "content": "This is the article content.",
    "status": "published"
  }'
```

---

## 🐛 Debugging

### View API Logs

```bash
docker logs -f agha-backend
```

### Enable Debug Mode

In `.env`:
```
DJANGO_DEBUG=True
```

⚠️ **Only in development!** Set to `False` in production.

### API Response Debugging

```python
# In Django shell
from django.test import Client
client = Client()
response = client.get('/api/content/')
print(response.status_code)
print(response.json())
```

---

## 🔐 API Security

### Rate Limiting
- Requests per minute: 60 (configurable)
- Maximum burst: 120 requests

### CORS Policy
Allowed origins (from `.env`):
```
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://100.93.255.84:3000
```

### CSRF Protection
- All POST/PUT/DELETE require CSRF token
- Token available in HTTP headers
- Frontend automatically handles

---

## 📚 Frontend Integration

### React Frontend Settings

In `frontend/.env`:
```
REACT_APP_BACKEND_API_URL=http://100.93.255.84:8000/api
```

### Example: Fetch from Frontend

```javascript
const token = localStorage.getItem('authToken');

fetch('http://100.93.255.84:8000/api/content/', {
    headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

---

## ✅ Checklist: Ready to Use

- [x] Database initialized with 55 tables
- [x] Admin user created (admin / admin123456)
- [x] Django admin accessible
- [x] REST API endpoints available
- [x] User authentication working
- [x] Content models ready
- [x] File uploads configured
- [x] Permissions system active
- [x] API documentation generated
- [x] Backend running on port 8000

Your backend is **fully operational and ready for data management!**

---

**Next Steps**:
1. Access Django Admin: `http://100.93.255.84:8000/admin`
2. Create additional user accounts
3. Add content via admin or API
4. Monitor data in PGAdmin: `http://100.93.255.84:5050`
5. Connect frontend to backend API
