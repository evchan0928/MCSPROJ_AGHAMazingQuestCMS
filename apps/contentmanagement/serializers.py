from rest_framework import serializers
from .models import ContentItem
from apps.usermanagement.serializers import UserSerializer


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
