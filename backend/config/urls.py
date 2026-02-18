"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.generic import RedirectView
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# API Schema configuration
schema_view = get_schema_view(
   openapi.Info(
      title="AGHAMazingQuestCMS API",
      default_version='v1',
      description="API for Mobile AR Tour Application",
      terms_of_service="https://www.example.com/terms/",
      contact=openapi.Contact(email="contact@aghamazing.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

def api_root(request):
    """
    Root endpoint for the API that serves the mobile AR tour app.
    Provides links to all available API endpoints.
    """
    return JsonResponse({
        'description': 'AGHAMazingQuestCMS API for Mobile AR Tour Application',
        'version': '1.0.0',
        'endpoints': {
            'authentication': {
                'login': '/api/auth/login/',
                'register': '/api/auth/register/',
                'refresh': '/api/auth/refresh/',
                'profile': '/api/auth/me/',
            },
            'content': {
                'content_items': '/api/content/items/',
                'mobile_content': '/api/content/game/content/',
                'public_content': '/api/content/game/public-content/',
            },
            'users': {
                'users_list': '/api/users/',
                'current_user': '/api/users/me/',
            },
            'analytics': {
                'analytics_data': '/api/analytics/',
            },
        },
        'documentation': '/api/docs/' if settings.DEBUG else None,
        'mobile_app_base_url': 'http://localhost:8000/api/',
        'frontend_url': 'http://localhost:3000/',
    })

urlpatterns = [
    # Main API endpoints
    path('admin/', admin.site.urls),
    
    # API endpoints - with root API info
    path('api/', api_root, name='api-root'),  # API root endpoint
    path('api/auth/', include('apps.authentication.urls')),
    path('api/content/', include('apps.contentmanagement.urls')),
    path('api/users/', include('apps.usermanagement.urls')),
    path('api/analytics/', include('apps.analyticsmanagement.urls')),
    path('api/mobile/', include('apps.mobilemanagement.urls')),  # Adding mobile management endpoints
    
    # API documentation
    path('api/swagger/', schema_view.with_ui(
        'swagger',
        cache_timeout=0
    ), name='schema-swagger-ui'),
    
    # For mobile AR tour app - direct access to public content
    path('mobile/', include([
        path('content/', include('apps.contentmanagement.urls')),
    ])),
    
    # Redirect from root to frontend (for when Django serves the root)
    path('', RedirectView.as_view(url='/api/', permanent=False), name='root-redirect'),
]

# During development serve media and static files through Django's static() helper
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)