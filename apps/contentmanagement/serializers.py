from rest_framework import serializers
from wagtail.models import Page  # Updated import for newer Wagtail versions
from .models import ContentItem, ContentPage
from apps.usermanagement.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class ContentItemSerializer(serializers.ModelSerializer):
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
        ]
        read_only_fields = ['slug', 'status', 'created_by', 'created_at', 'edited_by', 'edited_at', 'approved_by', 'approved_at', 'published_by', 'published_at', 'is_deleted']

    def create(self, validated_data):
        # file uploads handled by DRF parser
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)

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
            # Fallback: if url is already absolute, return it; else prefix origin
            if url.startswith('http'):
                return url
            return f"{request.scheme if request else 'https'}://{request.get_host() if request else ''}{url}"
        except Exception:
            return None


class ContentPageSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)
    approver_name = serializers.CharField(source='approver.username', read_only=True)
    
    class Meta:
        model = ContentPage
        fields = [
            'id', 'title', 'status', 'version_number', 'created_at', 'updated_at',
            'author', 'reviewer', 'approver', 'author_name', 'reviewer_name', 'approver_name',
            'previous_versions', 'featured_image', 'documents', 'video_url', 'body'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'version_number', 'previous_versions']

    def to_representation(self, instance):
        """Custom representation to handle Wagtail Page specifics"""
        data = super().to_representation(instance)
        # Add the specific page content if available
        if hasattr(instance, 'body'):
            data['body'] = str(instance.body)
        if hasattr(instance, 'title'):
            data['title'] = instance.title
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        # Create a new ContentPage instance with the validated data
        content_page = ContentPage(**validated_data)
        content_page.author = user  # Set the author to the current user
        content_page.save()
        return content_page