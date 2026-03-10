from django.shortcuts import render
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from django.contrib.auth.models import User
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta, datetime

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


@api_view(['GET'])
def get_mobile_analytics(request):
    """Get comprehensive mobile application analytics."""
    try:
        # Get data for the last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # User registration trends
        user_registrations = []
        for i in range(30):
            day = thirty_days_ago + timedelta(days=i)
            next_day = day + timedelta(days=1)
            
            daily_registrations = UserProfile.objects.filter(
                created_at__gte=day,
                created_at__lt=next_day
            ).count()
            
            user_registrations.append({
                'date': day.strftime('%Y-%m-%d'),
                'registrations': daily_registrations
            })
        
        # Active sessions over time
        active_sessions = []
        for i in range(30):
            day = thirty_days_ago + timedelta(days=i)
            next_day = day + timedelta(days=1)
            
            daily_sessions = UserSession.objects.filter(
                login_time__gte=day,
                login_time__lt=next_day
            ).count()
            
            active_sessions.append({
                'date': day.strftime('%Y-%m-%d'),
                'sessions': daily_sessions
            })
        
        # Scores distribution
        score_ranges = [
            {'range': '0-25%', 'count': Score.objects.filter(percentage__range=(0, 25)).count()},
            {'range': '26-50%', 'count': Score.objects.filter(percentage__range=(26, 50)).count()},
            {'range': '51-75%', 'count': Score.objects.filter(percentage__range=(51, 75)).count()},
            {'range': '76-100%', 'count': Score.objects.filter(percentage__range=(76, 100)).count()},
        ]
        
        # Badge distribution by type
        badge_types = Badge.objects.values('badge_type').annotate(count=Count('id'))
        badge_distribution = [
            {'type': item['badge_type'], 'count': item['count']}
            for item in badge_types
        ]
        
        # Top performing users by average score
        top_users = Score.objects.values('user__username').annotate(
            avg_score=Avg('percentage'),
            total_scores=Count('id')
        ).order_by('-avg_score')[:5]
        
        # Device information breakdown
        device_info = UserSession.objects.exclude(device_info='').values('device_info').annotate(
            count=Count('id')
        )[:10]  # Top 10 device types
        
        data = {
            'user_registration_trend': user_registrations,
            'active_sessions_trend': active_sessions,
            'score_distribution': score_ranges,
            'badge_distribution': badge_distribution,
            'top_users': list(top_users),
            'device_info_breakdown': list(device_info),
            'timestamp': timezone.now().isoformat(),
        }
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_user_engagement_analytics(request):
    """Get user engagement analytics for the mobile app."""
    try:
        # Average session duration (simulated since we don't have logout times)
        # We'll calculate based on last activity vs login time for recent sessions
        recent_sessions = UserSession.objects.filter(
            login_time__gte=timezone.now() - timedelta(days=7)
        )
        
        engagement_metrics = {
            'total_users': UserProfile.objects.count(),
            'active_users_last_7_days': UserSession.objects.filter(
                login_time__gte=timezone.now() - timedelta(days=7)
            ).distinct('user').count(),
            'active_users_last_30_days': UserSession.objects.filter(
                login_time__gte=timezone.now() - timedelta(days=30)
            ).distinct('user').count(),
            'total_sessions_last_7_days': recent_sessions.count(),
            'avg_scores_submitted_daily': Score.objects.filter(
                completed_at__gte=timezone.now() - timedelta(days=7)
            ).count() / 7,  # Average per day
            'badges_earned_daily': UserBadge.objects.filter(
                earned_at__gte=timezone.now() - timedelta(days=7)
            ).count() / 7,  # Average per day
        }
        
        # Engagement by day of week
        days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        weekly_engagement = []
        
        for i, day_name in enumerate(days_of_week):
            day_sessions = UserSession.objects.filter(
                login_time__week_day=i+1  # Django uses 1-7 for Sunday-Saturday
            ).count()
            
            weekly_engagement.append({
                'day': day_name,
                'sessions': day_sessions
            })
        
        # Content engagement (scores by content)
        popular_content = Score.objects.values('content_item__title').annotate(
            attempt_count=Count('id'),
            avg_percentage=Avg('percentage')
        ).order_by('-attempt_count')[:5]
        
        data = {
            'engagement_metrics': engagement_metrics,
            'weekly_engagement': weekly_engagement,
            'popular_content': list(popular_content),
            'timestamp': timezone.now().isoformat(),
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