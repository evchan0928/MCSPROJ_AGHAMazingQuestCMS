"""
Supabase Authentication Middleware

This middleware checks for Supabase authentication tokens and manages user sessions
"""

from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from utils.supabase_client import get_supabase_service
from django.contrib.auth import authenticate, login
from django.conf import settings
import jwt
import json


class SupabaseAuthMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Skip authentication for public endpoints
        public_paths = [
            '/auth/login/',
            '/auth/signup/',
            '/api/public/',
            '/admin/login/',
        ]
        
        # Check if the path is public
        if any(request.path.startswith(path) for path in public_paths):
            return None
        
        # Get the authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            # For non-API requests, we might want to redirect to login
            if request.path.startswith('/api/'):
                return JsonResponse({
                    'error': 'Authentication required. Please provide a valid token.'
                }, status=401)
            return None
        
        # Extract the token
        try:
            token_type, token = auth_header.split(' ')
            if token_type.lower() != 'bearer':
                return JsonResponse({
                    'error': 'Invalid token type. Expected Bearer token.'
                }, status=401)
        except ValueError:
            return JsonResponse({
                'error': 'Invalid authorization header format. Expected "Bearer <token>".'
            }, status=401)
        
        # Validate the token with Supabase
        supabase_service = get_supabase_service()
        client = supabase_service.get_client()
        
        try:
            # Verify the JWT token with Supabase
            user = client.auth.get_user(token)
            # At this point, we have a valid user from Supabase
            # We could create/update a Django user based on the Supabase user
            # or store the user data in the request for later use
            request.supabase_user = user
        except Exception as e:
            return JsonResponse({
                'error': f'Invalid or expired token: {str(e)}'
            }, status=401)
        
        return None