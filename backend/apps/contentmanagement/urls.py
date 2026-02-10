from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContentItemViewSet, 
    GamePublishedContentList, 
    PublicGameContentList,
    mobile_ar_tour_content,
    ar_tour_markers,
    health_check,
    api_status
)

router = DefaultRouter()
router.register(r'items', ContentItemViewSet, basename='contentitem')

urlpatterns = [
    path('', include(router.urls)),
    path('game/content/', GamePublishedContentList.as_view(), name='game-published-content'),
    path('game/public-content/', PublicGameContentList.as_view(), name='public-game-content'),
    path('mobile-ar-tour/', mobile_ar_tour_content, name='mobile-ar-tour-content'),
    path('ar-markers/', ar_tour_markers, name='ar-tour-markers'),
    path('health/', health_check, name='health-check'),
    path('status/', api_status, name='api-status'),
]