from rest_framework import serializers
from .models import ContentItem
from apps.usermanagement.serializers import UserSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class ContentItemSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=False)
    quiz_correct_answers = serializers.JSONField(required=False, default=dict)
    file_url = serializers.SerializerMethodField(read_only=True)
    # Expose related user objects (read-only) so the frontend can show names
    created_by = UserSerializer(read_only=True)
    edited_by = UserSerializer(read_only=True)
    approved_by = UserSerializer(read_only=True)
    published_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ContentItem
        fields = [
            'id', 'title', 'slug', 'body', 'file', 'status',
            'created_by', 'created_at', 'edited_by', 'edited_at',
            'approved_by', 'approved_at', 'published_by', 'published_at', 'is_deleted',
            'file_url',
            # Additional content management fields
            'content_type', 'meta_keywords', 'meta_description', 'photo_caption', 
            'highlights', 'ar_marker', 'quiz', 'enable_badges', 'chat_bot_allow', 'exclude_audio',
            # Quiz-specific fields
            'quiz_length', 'quiz_badges', 'quiz_number', 'quiz_correct_answers'
        ]
        read_only_fields = ['slug', 'created_at', 'edited_at', 'approved_at', 'published_at', 'is_deleted']

    def create(self, validated_data):
        # file uploads handled by DRF parser
        request = self.context.get('request') if getattr(self, 'context', None) else None
        # Only set created_by from request if it wasn't already provided
        if request and 'created_by' not in validated_data:
            validated_data['created_by'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Update edited_by when content is updated (defensive: request may be missing)
        request = self.context.get('request') if getattr(self, 'context', None) else None
        if request and 'edited_by' not in validated_data:
            validated_data['edited_by'] = request.user
        validated_data['edited_at'] = timezone.now()
        return super().update(instance, validated_data)

    def get_file_url(self, obj):
        """Return an absolute URL for the attached file if present.

        Uses request in context when available so the mobile app gets a usable URL.
        """
        try:
            if not obj.file:
                return None
            request = self.context.get('request') if self.context else None
            url = obj.file.url
            if request:
                return request.build_absolute_uri(url)
            # Fallback: if url is already absolute, return it; else construct properly
            if url.startswith('http'):
                return url
            # Construct the full URL using the host from the request or default to localhost:8001
            host = getattr(request, 'get_host', lambda: 'localhost:8001')()
            scheme = getattr(request, 'scheme', 'http')
            return f"{scheme}://{host}{url}"
        except Exception:
            return None