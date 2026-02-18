from django.shortcuts import render
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from django.contrib.auth.models import User

from .models import UserProfile, UserSession, Score, Badge, UserBadge, Leaderboard
from .serializers import (
    UserProfileSerializer, UserSessionSerializer, ScoreSerializer, 
    BadgeSerializer, UserBadgeSerializer, LeaderboardSerializer
)


class UserProfileViewSet(ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Allow users to see only their own profile unless they are admin
        if self.request.user.is_staff:
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user=self.request.user)


class UserSessionViewSet(ModelViewSet):
    queryset = UserSession.objects.all()
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Allow users to see only their own sessions unless they are admin
        if self.request.user.is_staff:
            return UserSession.objects.all()
        return UserSession.objects.filter(user=self.request.user)


class ScoreViewSet(ModelViewSet):
    queryset = Score.objects.all()
    serializer_class = ScoreSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Allow users to see only their own scores unless they are admin
        if self.request.user.is_staff:
            return Score.objects.all()
        return Score.objects.filter(user=self.request.user)


class BadgeViewSet(ModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]


class UserBadgeViewSet(ModelViewSet):
    queryset = UserBadge.objects.all()
    serializer_class = UserBadgeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Allow users to see only their own badges unless they are admin
        if self.request.user.is_staff:
            return UserBadge.objects.all()
        return UserBadge.objects.filter(user=self.request.user)


class LeaderboardViewSet(ModelViewSet):
    queryset = Leaderboard.objects.all()
    serializer_class = LeaderboardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Allow users to see all leaderboard entries
        # Could be filtered by category or time period as needed
        return Leaderboard.objects.all()