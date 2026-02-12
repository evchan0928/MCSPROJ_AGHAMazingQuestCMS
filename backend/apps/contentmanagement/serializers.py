from rest_framework import serializers
from .models import ContentItem, QuizQuestion, QuizChoice
from apps.usermanagement.serializers import UserSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class QuizChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizChoice
        fields = ['id', 'label', 'text', 'is_correct']


class QuizQuestionSerializer(serializers.ModelSerializer):
    choices = QuizChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = ['id', 'order', 'text', 'choices']


class ContentItemSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField(read_only=True)
    # Human-readable label for the content_type choice field
    content_type_display = serializers.SerializerMethodField(read_only=True)
    # Nested quiz data (when content_type == 'quiz')
    quiz_questions = QuizQuestionSerializer(many=True, read_only=True)
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
            'content_type_display',
            'highlights', 'ar_marker', 'quiz', 'enable_badges', 'chat_bot_allow', 'exclude_audio',
            # Quiz-specific fields
            'quiz_length', 'quiz_badges', 'quiz_number', 'quiz_correct_answers', 'quiz_questions'
        ]
        read_only_fields = ['slug', 'created_at', 'edited_at', 'approved_at', 'published_at', 'is_deleted']

    def create(self, validated_data):
        # file uploads handled by DRF parser
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Update edited_by when content is updated
        user = self.context['request'].user
        validated_data['edited_by'] = user
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
            # Fallback: if url is already absolute, return it; else prefix origin
            if url.startswith('http'):
                return url
            return f"{request.scheme if request else 'https'}://{request.get_host() if request else ''}{url}"
        except Exception:
            return None

    def get_content_type_display(self, obj):
        """Return human-readable label for `content_type` choice."""
        try:
            # Django provides `get_FOO_display()` for choice fields
            if hasattr(obj, 'get_content_type_display'):
                return obj.get_content_type_display()
            return getattr(obj, 'content_type', '')
        except Exception:
            return getattr(obj, 'content_type', '')