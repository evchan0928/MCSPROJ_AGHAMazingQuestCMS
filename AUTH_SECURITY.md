# Authentication Security Configuration

## Overview
This document explains the authentication security measures in the AGHAMazingQuestCMS and how to configure access controls.

## Current Authentication Flow

1. **Login Process**:
   - Users submit username/email and password to `/api/auth/login/`
   - Backend validates credentials against the database using Django's built-in authentication
   - Valid credentials return JWT access and refresh tokens
   - Invalid credentials return error message: `"No active account found with the given credentials"`

2. **Registration Process**:
   - New users can register via `/api/auth/register/`
   - Registration creates a new user account in the database
   - New users can immediately log in after registration

## Security Configuration

### Controlling Public Registration

By default, public registration is enabled. To disable public registration:

1. Set the `REGISTRATION_ENABLED` environment variable to `False`:
   ```
   REGISTRATION_ENABLED=False
   ```

2. In Docker environments, add to your `.env` file:
   ```
   REGISTRATION_ENABLED=False
   ```

3. For local development, set the environment variable before starting the server:
   ```bash
   export REGISTRATION_ENABLED=False
   python manage.py runserver
   ```

When registration is disabled:
- Attempts to register via `/api/auth/register/` will return a 403 Forbidden error
- Only existing users can log in
- Administrators must create accounts manually or via management commands

### Valid Accounts

Only accounts that exist in the database can log in. The system includes several default test accounts:
- admin / admin123 (superuser)
- demo_user / demo@example.com
- encoder_user / encoder@example.com
- editor_user / editor@example.com
- approver_user / approver@example.com

## Security Measures

1. **Credential Validation**: All login attempts are validated against the database
2. **SQL Injection Protection**: Django ORM prevents SQL injection attacks
3. **JWT Security**: Tokens are properly signed and have configurable expiration times
4. **Rate Limiting**: (Not implemented but recommended for production)

## Best Practices for Production

1. Disable public registration (`REGISTRATION_ENABLED=False`)
2. Have administrators create accounts for authorized users
3. Use strong passwords
4. Implement rate limiting for authentication endpoints
5. Use HTTPS in production
6. Regularly rotate JWT secrets