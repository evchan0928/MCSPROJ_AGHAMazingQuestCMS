from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContentItemViewSet, ContentPageViewSet
from .views import GamePublishedContentList

router = DefaultRouter()
router.register(r'items', ContentItemViewSet, basename='contentitem')
router.register(r'pages', ContentPageViewSet, basename='contentpage')

urlpatterns = [
    path('', include(router.urls)),
    path('game/content/', GamePublishedContentList.as_view(), name='game-published-content'),
]