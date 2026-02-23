from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_notifications, name='notifications-list'),
    path('unread-count/', views.get_unread_notification_count, name='unread-notification-count'),
    path('<int:pk>/mark-as-read/', views.mark_as_read, name='mark-notification-read'),
]