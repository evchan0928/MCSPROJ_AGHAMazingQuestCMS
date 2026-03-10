from rest_framework import serializers
from .models import ContentItem


class ContentItemSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ContentItem
        fields = '__all__'
        
    def get_file_url(self, obj):
        """Return an absolute URL for the attached file if present.

        Uses request in context when available so the mobile app gets a usable URL.
        """
        try:
            if not obj.file:
                return None
            request = self.context.get('request') if getattr(self, 'context', None) else None
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