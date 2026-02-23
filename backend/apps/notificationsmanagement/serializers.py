from rest_framework import serializers
from .models import Notification
from apps.usermanagement.serializers import UserSerializer


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'priority', 'is_read', 
            'created_at', 'related_content'
        ]
        read_only_fields = ['id', 'created_at']