from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_analytics_summary, name='analytics-summary'),
    path('summary/', views.get_analytics_summary, name='analytics-summary-detail'),
    path('content/', views.get_content_analytics, name='content-analytics'),
    path('users/', views.get_user_activity_analytics, name='user-analytics'),
]