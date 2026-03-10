from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'user-profiles', views.UserProfileViewSet)
router.register(r'user-sessions', views.UserSessionViewSet)
router.register(r'scores', views.ScoreViewSet)
router.register(r'badges', views.BadgeViewSet)
router.register(r'user-badges', views.UserBadgeViewSet)
router.register(r'leaderboards', views.LeaderboardViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', views.get_mobile_statistics, name='mobile-stats'),
    path('analytics/', views.get_mobile_analytics, name='mobile-analytics'),
    path('analytics/engagement/', views.get_user_engagement_analytics, name='mobile-engagement-analytics'),
]