"""
Supabase Client Utility for AGHAMazingQuestCMS

This module provides utilities for connecting to Supabase services including:
- Database operations via PostgREST
- Authentication via Supabase Auth
- Real-time subscriptions
"""

from supabase import create_client, Client
from django.conf import settings
import os

class SupabaseService:
    def __init__(self):
        # Get Supabase configuration from environment or settings
        self.url = os.environ.get('SUPABASE_URL', getattr(settings, 'SUPABASE_URL', None))
        self.key = os.environ.get('SUPABASE_ANON_KEY', getattr(settings, 'SUPABASE_ANON_KEY', None))
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment or settings")
        
        self.client: Client = create_client(self.url, self.key)

    def get_client(self) -> Client:
        """Returns the initialized Supabase client"""
        return self.client
    
    def authenticate_user(self, email: str, password: str):
        """Authenticate a user using Supabase Auth"""
        try:
            user = self.client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            return user
        except Exception as e:
            print(f"Authentication failed: {str(e)}")
            return None
    
    def sign_out(self):
        """Sign out the current user"""
        try:
            self.client.auth.sign_out()
        except Exception as e:
            print(f"Sign out failed: {str(e)}")
    
    def get_current_user(self):
        """Get the current authenticated user"""
        try:
            user = self.client.auth.get_user()
            return user
        except Exception as e:
            print(f"Getting current user failed: {str(e)}")
            return None

# Global instance to be used throughout the application
supabase_service = None

def get_supabase_service() -> SupabaseService:
    """Get the Supabase service instance, creating it if needed"""
    global supabase_service
    if supabase_service is None:
        supabase_service = SupabaseService()
    return supabase_service