from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .permissions import IsContentWorkflowAllowed
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import connection
from django.conf import settings
import json
from datetime import datetime

from .models import ContentItem
from .serializers import ContentItemSerializer
from .permissions import user_in_group
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q


class GamePublishedContentList(APIView):
    """Authenticated endpoint to list published content for mobile games.

    GET /api/content/game/content/ -> returns published items (status=published) with absolute file_url
    Mobile clients must include a valid token (e.g. JWT) in the Authorization header.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        qs = ContentItem.objects.filter(is_deleted=False, status=ContentItem.STATUS_PUBLISHED).order_by('-published_at')
        serializer = ContentItemSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class PublicGameContentList(APIView):
    """Public endpoint to list published content for mobile AR tour app.

    GET /api/content/game/public-content/ -> returns published items (status=published) with absolute file_url
    No authentication required, only for public content.
    """
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        # Filter only public content that is published.
        # Some deployments may not have an `is_public` field on the model
        # (older schema). Guard against that to avoid 500 errors.
        try:
            qs = ContentItem.objects.filter(
                is_deleted=False, 
                status=ContentItem.STATUS_PUBLISHED,
                is_public=True
            ).order_by('-published_at')
        except Exception:
            # Fallback: return published items and let the mobile client
            # decide which ones to display. Log the exception server-side.
            qs = ContentItem.objects.filter(
                is_deleted=False, 
                status=ContentItem.STATUS_PUBLISHED,
            ).order_by('-published_at')

        serializer = ContentItemSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def mobile_ar_tour_content(request):
    """
    Simplified endpoint specifically for mobile AR tour app.
    Returns only content relevant to AR experiences.
    """
    try:
        content_items = ContentItem.objects.filter(
            is_deleted=False,
            status=ContentItem.STATUS_PUBLISHED,
            is_public=True,
            content_type='ar_experience'
        ).order_by('-published_at')
    except Exception:
        content_items = ContentItem.objects.filter(
            is_deleted=False,
            status=ContentItem.STATUS_PUBLISHED,
            content_type='ar_experience'
        ).order_by('-published_at')

    # Serialize the content defensively (some fields may be missing)
    serialized_data = []
    for item in content_items:
        serialized_data.append({
            'id': item.id,
            'title': getattr(item, 'title', ''),
            'description': getattr(item, 'body', '') or getattr(item, 'description', ''),
            'content_type': getattr(item, 'content_type', ''),
            'content_type_display': item.get_content_type_display() if hasattr(item, 'get_content_type_display') else getattr(item, 'content_type', ''),
            'ar_marker': getattr(item, 'ar_marker', False),
            'chat_bot_allow': getattr(item, 'chat_bot_allow', True),
            'created_at': item.created_at.isoformat() if getattr(item, 'created_at', None) else None,
            'published_at': item.published_at.isoformat() if getattr(item, 'published_at', None) else None,
        })
    
    return Response({
        'success': True,
        'count': len(serialized_data),
        'data': serialized_data,
        'meta': {
            'timestamp': datetime.now().isoformat(),
            'version': '1.0.0',
            'app_type': 'mobile-ar-tour'
        }
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def public_quizzes(request):
    """Public endpoint returning published quizzes and their questions/choices.

    GET /api/content/quizzes/public/ -> list of quizzes with nested questions and choices
    """
    try:
        qs = ContentItem.objects.filter(
            is_deleted=False,
            status=ContentItem.STATUS_PUBLISHED,
            content_type='quiz',
            is_public=True
        ).order_by('-published_at')
    except Exception:
        qs = ContentItem.objects.filter(
            is_deleted=False,
            status=ContentItem.STATUS_PUBLISHED,
            content_type='quiz'
        ).order_by('-published_at')

    serializer = ContentItemSerializer(qs, many=True, context={'request': request})
    return Response({
        'success': True,
        'count': len(serializer.data),
        'data': serializer.data,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def ar_tour_markers(request):
    """
    Endpoint to retrieve AR markers for the mobile app.
    """
    try:
        markers_qs = ContentItem.objects.filter(
            is_deleted=False,
            status=ContentItem.STATUS_PUBLISHED,
            is_public=True,
            content_type='ar_experience',
            ar_marker__isnull=False
        ).values('id', 'title', 'ar_marker', 'description', 'content_type')
    except Exception:
        markers_qs = ContentItem.objects.filter(
            is_deleted=False,
            status=ContentItem.STATUS_PUBLISHED,
            content_type='ar_experience',
            ar_marker__isnull=False
        ).values('id', 'title', 'ar_marker', 'content_type')

    # Build marker list safely
    markers = []
    # Resolve human-readable labels for content_type choices
    content_type_choices = dict(ContentItem._meta.get_field('content_type').choices)
    for m in list(markers_qs):
        markers.append({
            'id': m.get('id'),
            'title': m.get('title'),
            'ar_marker': m.get('ar_marker'),
            'description': m.get('description', ''),
            'content_type': m.get('content_type', ''),
            'content_type_display': content_type_choices.get(m.get('content_type'), m.get('content_type'))
        })

    return Response({
        'success': True,
        'markers': markers,
        'count': len(markers)
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for monitoring the API status.
    """
    try:
        # Test database connection
        connection.ensure_connection()
        db_available = True
    except Exception:
        db_available = False
    
    # Prepare response data
    health_data = {
        'status': 'healthy' if db_available else 'unhealthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'database': 'connected' if db_available else 'disconnected',
            'api_server': 'running',
        },
        'version': '1.0.0',
        'app': 'AGHAMazingQuestCMS',
        'for': 'Mobile AR Tour Application'
    }
    
    status_code = 200 if db_available else 503
    return Response(health_data, status=status_code)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_status(request):
    """
    Detailed API status information for the mobile AR tour app.
    """
    try:
        # Test database connection
        connection.ensure_connection()
        db_available = True
        db_error = None
    except Exception as e:
        db_available = False
        db_error = str(e)
    
    # Count published content items (guard for optional `is_public` field)
    try:
        try:
            published_count = ContentItem.objects.filter(
                is_deleted=False,
                status=ContentItem.STATUS_PUBLISHED,
                is_public=True
            ).count()
        except Exception:
            published_count = ContentItem.objects.filter(
                is_deleted=False,
                status=ContentItem.STATUS_PUBLISHED
            ).count()
    except:
        published_count = 0
    
    status_data = {
        'api_status': 'operational' if db_available else 'degraded',
        'timestamp': datetime.now().isoformat(),
        'uptime': getattr(request, '_request_start_time', datetime.now().isoformat()),
        'components': {
            'database': {
                'status': 'operational' if db_available else 'error',
                'error': db_error
            },
            'content_management': {
                'status': 'operational',
                'published_content_count': published_count
            },
            'authentication': {
                'status': 'operational'
            }
        },
        'version': '1.0.0',
        'environment': 'development' if settings.DEBUG else 'production',
        'app_purpose': 'Mobile AR Tour Application Backend'
    }
    
    status_code = 200 if db_available else 503
    return Response(status_data, status=status_code)


class ContentItemViewSet(viewsets.ModelViewSet):
    queryset = ContentItem.objects.filter(is_deleted=False).all()
    serializer_class = ContentItemSerializer
    # Require authentication and check role-based permissions for actions
    permission_classes = [IsAuthenticated, IsContentWorkflowAllowed]

    def get_queryset(self):
        qs = ContentItem.objects.filter(is_deleted=False)
        status_q = self.request.query_params.get('status')
        if status_q:
            qs = qs.filter(status=status_q)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        # When a new content item is uploaded by an Encoder/Editor, set its status
        # to 'edited' (i.e. ready for final editing) and record who created it.
        # Save with the new workflow initial state: For editing
        serializer.save(created_by=self.request.user, status=ContentItem.STATUS_FOR_EDITING)

    def create(self, request, *args, **kwargs):
        """Create endpoint returns a friendly message and the created Content ID.

        Successful response example:
        {
            "success": true,
            "message": "Content created successfully",
            "data": {
                "id": 123,
                "title": "New Content Item"
            }
        }
        """
        try:
            response = super().create(request, *args, **kwargs)
            if response.status_code == status.HTTP_201_CREATED:
                content_item = response.data
                response.data = {
                    "success": True,
                    "message": "Content created successfully",
                    "data": {
                        "id": content_item.get('id'),
                        "title": content_item.get('title'),
                    }
                }
            return response
        except Exception as e:
            # Return a helpful error payload for debugging. In production
            # you may want to log the full traceback instead of returning it.
            import traceback
            tb = traceback.format_exc()
            detail = str(e)
            payload = {
                'success': False,
                'message': 'Failed to create content item',
                'error': detail,
            }
            if getattr(settings, 'DEBUG', False):
                payload['traceback'] = tb
            return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def publish(self, request, pk=None):
        """Custom action to change the status of a content item to published."""
        content_item = self.get_object()
        content_item.status = ContentItem.STATUS_PUBLISHED
        content_item.save()
        serializer = self.get_serializer(content_item)
        return Response({
            "success": True,
            "message": f"Content '{content_item.title}' published successfully",
            "data": serializer.data
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        """Custom action to approve content for publishing."""
        content_item = self.get_object()
        if user_in_group(request.user, 'Approver') or user_in_group(request.user, 'Admin'):
            content_item.status = ContentItem.STATUS_FOR_PUBLISHING
            content_item.approved_by = request.user
            content_item.save()
            serializer = self.get_serializer(content_item)
            return Response({
                "success": True,
                "message": f"Content '{content_item.title}' approved for publishing",
                "data": serializer.data
            })
        else:
            return Response({
                "success": False,
                "message": "You do not have permission to approve content"
            }, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def archive(self, request, pk=None):
        """Custom action to archive a content item."""
        content_item = self.get_object()
        content_item.is_archived = True
        content_item.save()
        serializer = self.get_serializer(content_item)
        return Response({
            "success": True,
            "message": f"Content '{content_item.title}' archived successfully",
            "data": serializer.data
        })