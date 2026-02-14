from django.urls import path
from rest_framework_simplejwt.views import (
	TokenObtainPairView,
	TokenRefreshView,
)
from .views import RegisterView, MeView, PasswordResetView

urlpatterns = [
	path('register/', RegisterView.as_view(), name='auth-register'),
	path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path('me/', MeView.as_view(), name='auth-me'),
	path('password/reset/', PasswordResetView.as_view(), name='password_reset'),
]
