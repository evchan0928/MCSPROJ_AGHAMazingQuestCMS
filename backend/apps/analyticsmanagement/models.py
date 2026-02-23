from django.db import models
from django.contrib.auth import get_user_model
from apps.contentmanagement.models import ContentItem

User = get_user_model()


class ContentViewTracking(models.Model):
    """Model for tracking content views"""
    content_item = models.ForeignKey(ContentItem, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)  # For anonymous users
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    user_agent = models.TextField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Content View'
        verbose_name_plural = 'Content Views'
        indexes = [
            models.Index(fields=['content_item', '-viewed_at']),
            models.Index(fields=['viewed_at']),
        ]


class ContentEngagement(models.Model):
    """Model for tracking user engagement with content"""
    ACTION_CHOICES = [
        ('view', 'View'),
        ('like', 'Like'),
        ('share', 'Share'),
        ('comment', 'Comment'),
        ('download', 'Download'),
        ('complete_quiz', 'Complete Quiz'),
    ]
    
    content_item = models.ForeignKey(ContentItem, on_delete=models.CASCADE, related_name='engagements')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)  # Store additional data about the engagement
    
    class Meta:
        verbose_name = 'Content Engagement'
        verbose_name_plural = 'Content Engagements'
        indexes = [
            models.Index(fields=['content_item', 'action', '-timestamp']),
            models.Index(fields=['timestamp']),
        ]
