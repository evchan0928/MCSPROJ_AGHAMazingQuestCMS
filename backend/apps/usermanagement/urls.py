from django.urls import path
from . import views

urlpatterns = [
    # Existing user management URLs
    path('', views.user_list_view, name='user-list'),
    path('<int:user_id>/', views.user_detail_view, name='user-detail'),
    path('roles/', views.user_roles_view, name='user-roles'),
    path('roles/create/', views.create_role_view, name='create-role'),
    path('roles/<int:role_id>/', views.role_detail_view, name='role-detail'),
    
    # New dashboard URLs
    path('dashboard/stats/', views.get_dashboard_stats, name='dashboard-stats'),
    path('content/recent/', views.get_recent_content, name='recent-content'),
    # Mobile API endpoints
    path('mobile/profile/', views.mobile_profile_view, name='mobile-profile'),
    path('mobile/register/', views.mobile_register_view, name='mobile-register'),
    path('mobile/score/', views.mobile_score_view, name='mobile-score'),
    path('mobile/leaderboard/', views.mobile_leaderboard_view, name='mobile-leaderboard'),
    path('mobile/badges/', views.mobile_badges_view, name='mobile-badges'),
    path('mobile/session/', views.mobile_session_view, name='mobile-session'),
    path('mobile/otp/', views.mobile_otp_view, name='mobile-otp'),
    path('mobile/tokens/', views.mobile_tokens_view, name='mobile-tokens'),
]