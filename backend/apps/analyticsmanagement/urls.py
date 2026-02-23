from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_analytics_summary, name='analytics-summary'),
    path('summary/', views.get_analytics_summary, name='analytics-summary-detail'),
    path('content/', views.get_content_analytics, name='content-analytics'),
    path('users/', views.get_user_activity_analytics, name='user-analytics'),
    path('engagement/', views.get_content_engagement_metrics, name='content-engagement-metrics'),
    path('views-over-time/', views.get_views_over_time, name='views-over-time'),
    path('generate/', views.generate_analytics_report, name='generate-analytics-report'),
    path('download/', views.download_analytics_report, name='download-analytics-report'),
]