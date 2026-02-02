from django.urls import path
from . import views

urlpatterns = [
    # Existing user management URLs
    path('', views.user_list_view, name='user-list'),
    path('<int:user_id>/', views.user_detail_view, name='user-detail'),
    path('roles/', views.user_roles_view, name='user-roles'),
    
    # New dashboard URLs
    path('dashboard/stats/', views.get_dashboard_stats, name='dashboard-stats'),
    path('content/recent/', views.get_recent_content, name='recent-content'),
]