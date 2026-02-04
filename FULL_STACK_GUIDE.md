# AGHAMazingQuestCMS Full Stack Guide

## Overview

AGHAMazingQuestCMS is a comprehensive content management system designed for educational content and interactive learning quests. This full-stack application combines a React frontend with a Django/Wagtail backend, providing a complete solution for content creation, management, and publication workflows.

## Application Architecture

### Frontend (React)
- **Framework**: React 18+ with functional components and hooks
- **Routing**: React Router for navigation between modules
- **Styling**: CSS modules and custom styles
- **API Communication**: Axios with interceptors for authentication
- **State Management**: React hooks and localStorage for JWT tokens

### Backend (Django/Wagtail)
- **Framework**: Django 4.x with Wagtail CMS
- **Authentication**: JWT-based authentication with refresh tokens
- **Database**: PostgreSQL for all data persistence
- **API**: RESTful endpoints with DRF (Django Rest Framework)
- **Security**: CSRF protection and role-based access control

## Modules Overview

### 1. Authentication Module
- **Login/Sign In**: Secure authentication with JWT tokens
- **Credentials**: Username `admin`, Password `admin123`
- **Role-based Access**: Different permissions based on user roles
- **Token Management**: Automatic refresh of expired tokens

### 2. Dashboard Module
- **Statistics**: Real-time dashboard showing published content, pending approvals, active users, and notifications
- **Recent Content**: Table view of recently added content with status indicators
- **Filtering**: Date range and product type filters for content analysis

### 3. Content Management Module
#### Upload Content
- **Multi-file Upload**: Support for various content types (images, videos, documents)
- **Metadata Entry**: Form for entering content details and properties
- **Workflow Status**: Automatically sets content to "For Editing" status

#### Content List
- **Browse All Content**: View all content items with filtering options
- **Detailed View**: Access to individual content details
- **Bulk Actions**: Select multiple items for bulk operations

#### Approve Content
- **Review Queue**: View content awaiting approval
- **Approval Workflow**: Accept or reject content based on quality standards
- **Status Updates**: Automatically update content status after decisions

#### Publish Content
- **Ready for Publication**: View content approved and ready to publish
- **Publication Controls**: Publish content to make it publicly available
- **Status Tracking**: Track content through the publication process

#### Published Content
- **Published Items**: View all currently published content
- **Performance Metrics**: Basic analytics for published content
- **Reversion Options**: Ability to unpublish content if needed

#### Delete Content
- **Content Removal**: Remove content from the system
- **Permissions Required**: Only admins can delete content
- **Confirmation Required**: Double confirmation to prevent accidental deletion

### 4. User Management Module
#### Users
- **User Directory**: Browse all registered users
- **User Details**: View detailed information about each user
- **Role Assignment**: Assign roles to users as needed

#### Roles
- **Role Definitions**: View all available roles and their permissions
- **Role Management**: Create and modify role definitions
- **Permission Mapping**: Map specific permissions to each role

### 5. Analytics Module
#### Generate Report
- **Report Creation**: Create custom reports based on various metrics
- **Date Ranges**: Specify time periods for report generation
- **Export Options**: Export reports in various formats

#### View Reports
- **Generated Reports**: Browse previously generated reports
- **Interactive Charts**: Visual representation of data
- **Drill-down Capability**: Detailed views of specific metrics

#### Download Reports
- **Export Functionality**: Download reports in various formats (PDF, CSV, Excel)
- **Batch Downloads**: Download multiple reports at once
- **Format Selection**: Choose the appropriate format for your needs

## How to Use Each Module

### Getting Started
1. Start the backend server: `cd backend && python manage.py runserver`
2. Start the frontend server: `cd frontend && npm start`
3. Navigate to `http://localhost:3000/`
4. Log in with username `admin` and password `admin123`

### Content Creation Workflow
1. **Upload Content**: Go to "Content Management" > "Upload Content" to add new content
2. **Edit Content**: Content items start in "For Editing" status - editors can refine them
3. **Submit for Approval**: Move content to "For Approval" status when ready
4. **Approve Content**: Approvers review and approve content for publication
5. **Publish Content**: Publishers release approved content to the public
6. **Monitor Performance**: Track published content in the "Published Content" section

### User Management
1. **Access User Management**: Navigate to "User & Role Management" > "Users"
2. **View User Details**: Click on any user to see their details and assigned roles
3. **Manage Roles**: Go to "User & Role Management" > "Roles" to view role definitions
4. **Assign Roles**: Use the Django admin to assign roles to users

### Analytics
1. **Generate Reports**: Go to "Analytics Management" > "Generate Report" to create new reports
2. **View Reports**: Navigate to "Analytics Management" > "View Reports" to see generated reports
3. **Download Reports**: Use "Analytics Management" > "Download Reports" to export data

## Security Features

- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-Based Access Control**: Different permissions for different user roles
- **CSRF Protection**: Cross-Site Request Forgery protection
- **Secure Password Storage**: Bcrypt or similar for password hashing
- **Session Management**: Proper session handling with auto-expiration

## Troubleshooting

### Common Issues
- **Login Failure**: Ensure you're using the correct credentials (admin/admin123)
- **Network Errors**: Verify both backend and frontend servers are running
- **Permission Denied**: Check that your user role has the required permissions
- **Missing Content**: Ensure content has completed the approval workflow

### Resetting the Application
If you need to reset the application state:
1. Stop both servers (Ctrl+C)
2. Clear browser cache and localStorage
3. Restart both servers
4. Log in with the default credentials

## Development

### Adding New Modules
New modules can be added by:
1. Creating new React components in the `src/pages` directory
2. Adding routes in `src/App.jsx`
3. Creating corresponding backend API endpoints
4. Updating the sidebar navigation in `src/Sidebar.jsx`

### Extending Functionality
- **Frontend**: Add new components following the existing patterns
- **Backend**: Create new Django apps with models, views, and serializers
- **API**: Ensure proper authentication and permission checks
- **UI**: Maintain consistency with existing design patterns

## Conclusion

The AGHAMazingQuestCMS provides a complete, role-based content management solution with comprehensive functionality for creating, managing, approving, and publishing educational content. The full-stack architecture ensures seamless integration between the user-friendly React frontend and the powerful Django/Wagtail backend.