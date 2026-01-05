from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, RoleListView

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
	# Ensure the explicit 'roles/' path is checked before router detail routes
	# which could otherwise capture 'roles' as a user PK and return 404.
	path('roles/', RoleListView.as_view(), name='user-roles'),
	path('', include(router.urls)),
]
