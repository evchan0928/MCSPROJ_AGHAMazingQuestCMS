from django.shortcuts import render
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from django.contrib.auth.models import User
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta

from .models import UserProfile, UserSession, Score, Badge, UserBadge, Leaderboard
from .serializers import (
    UserProfileSerializer, UserSessionSerializer, ScoreSerializer, 
    BadgeSerializer, UserBadgeSerializer, LeaderboardSerializer
)


@api_view(['GET'])
def get_mobile_statistics(request):
    """Get mobile application statistics."""
    try:
        # Calculate user profiles count
        total_profiles = UserProfile.objects.count()
        
        # Calculate active sessions
        # Sessions created in the last 30 minutes are considered active
        thirty_mins_ago = timezone.now() - timedelta(minutes=30)
        active_sessions = UserSession.objects.filter(
            created_at__gte=thirty_mins_ago,
            is_active=True
        ).count()
        
        # Calculate total scores
        total_scores = Score.objects.aggregate(total=Sum('score'))['total'] or 0
        total_score_records = Score.objects.count()
        
        # Calculate badges earned
        total_badges_earned = UserBadge.objects.count()
        total_unique_badges = Badge.objects.count()
        
        # Additional stats
        recent_profiles = UserProfile.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        avg_scores_per_user = Score.objects.aggregate(avg=Avg('score'))['avg'] or 0
        
        data = {
            'statistics': {
                'total_user_profiles': total_profiles,
                'active_sessions': active_sessions,
                'total_score_records': total_score_records,
                'total_badges_earned': total_badges_earned,
                'total_unique_badges': total_unique_badges,
                'recent_profiles_last_7_days': recent_profiles,
                'average_score_per_user': round(avg_scores_per_user, 2),
                'timestamp': timezone.now().isoformat(),
            }
        }
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileViewSet(ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Handle schema generation by checking for fake view
        if getattr(self, 'swagger_fake_view', False):
            return UserProfile.objects.none()
        # Allow users to see only their own profile unless they are admin
        if self.request.user.is_staff:
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user=self.request.user)


class UserSessionViewSet(ModelViewSet):
    queryset = UserSession.objects.all()
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Handle schema generation by checking for fake view
        if getattr(self, 'swagger_fake_view', False):
            return UserSession.objects.none()
        # Allow users to see only their own sessions unless they are admin
        if self.request.user.is_staff:
            return UserSession.objects.all()
        return UserSession.objects.filter(user=self.request.user)


class ScoreViewSet(ModelViewSet):
    queryset = Score.objects.all()
    serializer_class = ScoreSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Handle schema generation by checking for fake view
        if getattr(self, 'swagger_fake_view', False):
            return Score.objects.none()
        # Allow users to see only their own scores unless they are admin
        if self.request.user.is_staff:
            return Score.objects.all()
        return Score.objects.filter(user=self.request.user)


class BadgeViewSet(ModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Handle schema generation by checking for fake view
        if getattr(self, 'swagger_fake_view', False):
            return Badge.objects.none()
        return Badge.objects.all()


class UserBadgeViewSet(ModelViewSet):
    queryset = UserBadge.objects.all()
    serializer_class = UserBadgeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Handle schema generation by checking for fake view
        if getattr(self, 'swagger_fake_view', False):
            return UserBadge.objects.none()
        # Allow users to see only their own badges unless they are admin
        if self.request.user.is_staff:
            return UserBadge.objects.all()
        return UserBadge.objects.filter(user=self.request.user)


class LeaderboardViewSet(ModelViewSet):
    queryset = Leaderboard.objects.all()
    serializer_class = LeaderboardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Handle schema generation by checking for fake view
        if getattr(self, 'swagger_fake_view', False):
            return Leaderboard.objects.none()
        # Allow users to see all leaderboard entries
        # Could be filtered by category or time period as needed
        return Leaderboard.objects.all()