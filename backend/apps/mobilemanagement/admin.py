from django.contrib import admin
from .models import UserProfile, UserSession, Score, Badge, UserBadge, Leaderboard


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'birth_date', 'is_mobile_user', 'created_at']
    list_filter = ['is_mobile_user', 'created_at']
    search_fields = ['user__username', 'user__email', 'location']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'login_time', 'is_active', 'expires_at']
    list_filter = ['is_active', 'login_time']
    search_fields = ['user__username', 'session_token']
    readonly_fields = ['login_time', 'last_activity']


@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ['user', 'content_item', 'score', 'percentage', 'completed_at']
    list_filter = ['completed_at', 'percentage']
    search_fields = ['user__username', 'content_item__title']
    readonly_fields = ['completed_at', 'updated_at']


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'badge_type', 'points_value', 'created_at']
    list_filter = ['badge_type', 'created_at']
    search_fields = ['name', 'description']


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge', 'earned_at']
    list_filter = ['earned_at', 'badge__badge_type']
    search_fields = ['user__username', 'badge__name']


@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ['user', 'rank', 'score', 'category', 'period_start', 'period_end']
    list_filter = ['category', 'period_start', 'period_end']
    search_fields = ['user__username', 'category']
    readonly_fields = ['created_at']