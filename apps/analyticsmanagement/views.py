from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from apps.contentmanagement.models import ContentItem, ContentPage
from django.contrib.auth import get_user_model


@api_view(['GET'])
def get_analytics_summary(request):
    """Get basic analytics summary for the content management system."""
    try:
        # Calculate content metrics
        total_content_items = ContentItem.objects.count()
        published_content = ContentItem.objects.filter(status=ContentItem.STATUS_PUBLISHED).count()
        content_in_review = ContentItem.objects.filter(
            status__in=[ContentItem.STATUS_FOR_APPROVAL, ContentItem.STATUS_FOR_PUBLISHING]
        ).count()
        
        # Calculate content pages metrics
        total_content_pages = ContentPage.objects.count()
        
        # Calculate recent activity (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recently_created = ContentItem.objects.filter(created_at__gte=thirty_days_ago).count()
        
        data = {
            'summary': {
                'total_content_items': total_content_items,
                'published_content': published_content,
                'content_in_review': content_in_review,
                'total_content_pages': total_content_pages,
                'recently_created': recently_created,
                'timestamp': timezone.now().isoformat(),
            }
        }
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_content_analytics(request):
    """Detailed analytics about content items."""
    try:
        # Get content by status
        content_by_status = {}
        for status_choice, status_label in ContentItem.STATUS_CHOICES:
            count = ContentItem.objects.filter(status=status_choice).count()
            content_by_status[status_choice] = {
                'label': status_label,
                'count': count
            }
        
        # Get recently published content
        recently_published = []
        published_items = ContentItem.objects.filter(
            status=ContentItem.STATUS_PUBLISHED
        ).order_by('-published_at')[:10]
        
        for item in published_items:
            recently_published.append({
                'id': item.id,
                'title': item.title,
                'published_at': item.published_at.isoformat() if item.published_at else None,
                'published_by': item.published_by.username if item.published_by else None
            })
        
        data = {
            'content_by_status': content_by_status,
            'recently_published': recently_published,
            'timestamp': timezone.now().isoformat(),
        }
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_user_activity_analytics(request):
    """Analytics about user activities."""
    try:
        User = get_user_model()
        
        # Get user statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        
        # Get content creators
        content_creators = []
        creators = User.objects.extra(select={
            'content_count': 'SELECT COUNT(*) FROM contentmanagement_contentitem WHERE contentmanagement_contentitem.created_by_id = auth_user.id'
        }).order_by('-content_count')[:10]
        
        for creator in creators:
            content_creators.append({
                'id': creator.id,
                'username': creator.username,
                'email': creator.email,
                'content_count': getattr(creator, 'content_count', 0)
            })
        
        data = {
            'user_stats': {
                'total_users': total_users,
                'active_users': active_users,
            },
            'top_content_creators': content_creators,
            'timestamp': timezone.now().isoformat(),
        }
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
