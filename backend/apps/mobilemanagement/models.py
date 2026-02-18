from django.db import models
from django.contrib.auth.models import User
from django.conf import settings


class UserProfile(models.Model):
    """
    Model for storing mobile user profiles
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mobile_profile')
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=30, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    avatar = models.URLField(max_length=500, blank=True)  # URL to avatar image
    phone_number = models.CharField(max_length=15, blank=True)
    is_mobile_user = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Mobile Profile"

    class Meta:
        verbose_name = "Mobile User Profile"
        verbose_name_plural = "Mobile User Profiles"


class UserSession(models.Model):
    """
    Model for tracking mobile user sessions
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mobile_sessions')
    session_token = models.CharField(max_length=255, unique=True)
    device_info = models.TextField(max_length=1000, blank=True)  # Store device info as JSON string
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(max_length=500, blank=True)
    login_time = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Session"

    class Meta:
        verbose_name = "Mobile User Session"
        verbose_name_plural = "Mobile User Sessions"


class Score(models.Model):
    """
    Model for tracking user scores in the mobile app
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='scores')
    content_item = models.ForeignKey('contentmanagement.ContentItem', on_delete=models.CASCADE, null=True, blank=True)
    score = models.IntegerField(default=0)
    max_score = models.IntegerField(default=0)
    percentage = models.FloatField(default=0.0)  # Calculated percentage score
    attempts = models.IntegerField(default=1)  # Number of attempts
    completed_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Score on {self.content_item.title if self.content_item else 'General'}"

    class Meta:
        verbose_name = "Score"
        verbose_name_plural = "Scores"
        ordering = ['-completed_at']


class Badge(models.Model):
    """
    Model for tracking badges in the mobile app
    """
    BADGE_TYPES = [
        ('achievement', 'Achievement'),
        ('milestone', 'Milestone'),
        ('participation', 'Participation'),
        ('performance', 'Performance'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(max_length=500)
    badge_type = models.CharField(max_length=20, choices=BADGE_TYPES, default='achievement')
    icon_url = models.URLField(max_length=500, blank=True)  # URL to badge icon/image
    points_value = models.IntegerField(default=0)  # Points awarded for earning this badge
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Badge"
        verbose_name_plural = "Badges"


class UserBadge(models.Model):
    """
    Junction model for tracking which users have earned which badges
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='badges_earned')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='awarded_users')
    earned_at = models.DateTimeField(auto_now_add=True)
    evidence = models.TextField(max_length=1000, blank=True)  # Optional evidence for earning the badge

    def __str__(self):
        return f"{self.user.username} earned {self.badge.name}"

    class Meta:
        verbose_name = "User Badge"
        verbose_name_plural = "User Badges"
        unique_together = ('user', 'badge')


class Leaderboard(models.Model):
    """
    Model for tracking leaderboard entries
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='leaderboard_entries')
    score = models.IntegerField(default=0)
    rank = models.IntegerField()
    period_start = models.DateTimeField()  # Start of the period this leaderboard entry covers
    period_end = models.DateTimeField()  # End of the period this leaderboard entry covers
    category = models.CharField(max_length=100, blank=True)  # Category of the leaderboard (weekly, monthly, etc.)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - Rank #{self.rank} with {self.score} points"

    class Meta:
        verbose_name = "Leaderboard Entry"
        verbose_name_plural = "Leaderboard Entries"
        ordering = ['period_start', 'rank']