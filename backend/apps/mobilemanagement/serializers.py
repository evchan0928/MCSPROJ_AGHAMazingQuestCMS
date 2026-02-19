from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, UserSession, Score, Badge, UserBadge, Leaderboard


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        ref_name = 'MobileManagementUser'  # Unique ref_name to avoid conflict


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'


class UserSessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserSession
        fields = '__all__'


class ScoreSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Score
        fields = '__all__'


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'


class UserBadgeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = UserBadge
        fields = '__all__'


class LeaderboardSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Leaderboard
        fields = '__all__'