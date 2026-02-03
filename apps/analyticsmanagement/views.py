from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta, datetime
from apps.contentmanagement.models import ContentItem, ContentPage
from django.contrib.auth import get_user_model
from django.db.models import Count, Q


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


@api_view(['POST'])
def generate_analytics_report(request):
    """Generate a custom analytics report based on the provided parameters."""
    try:
        # Extract parameters from the request
        report_type = request.data.get('report_type', 'comprehensive')
        date_from_str = request.data.get('date_from')
        date_to_str = request.data.get('date_to')
        content_type = request.data.get('content_type', 'all')
        metrics_param = request.data.get('metrics', '')
        
        # Parse dates if provided
        date_from = None
        date_to = None
        if date_from_str:
            date_from = datetime.strptime(date_from_str, '%Y-%m-%d')
        if date_to_str:
            date_to = datetime.strptime(date_to_str, '%Y-%m-%d')
        
        # Parse metrics
        metrics = metrics_param.split(',') if metrics_param else ['views', 'engagement', 'downloads']
        
        # Build query filters
        content_filter = Q()
        
        if date_from:
            content_filter &= Q(created_at__gte=date_from)
        if date_to:
            content_filter &= Q(created_at__lte=date_to)
        if content_type and content_type != 'all':
            content_filter &= Q(content_type=content_type)
        
        # Query content items based on filters
        filtered_content = ContentItem.objects.filter(content_filter)
        
        # Calculate metrics based on the report type and filters
        total_content = filtered_content.count()
        published_count = filtered_content.filter(status=ContentItem.STATUS_PUBLISHED).count()
        
        # Get views over time (using created_at as a proxy for now)
        views_over_time = []
        if 'views' in metrics:
            # Group content by date and count
            content_by_date = filtered_content.extra(
                select={'date': 'DATE(created_at)'}
            ).values('date').annotate(count=Count('id')).order_by('date')
            
            for item in content_by_date:
                views_over_time.append({
                    'date': item['date'].strftime('%Y-%m-%d'),
                    'views': item['count']
                })
        
        # Content distribution by type
        content_distribution = []
        if 'engagement' in metrics:
            type_counts = filtered_content.values('content_type').annotate(
                count=Count('id')
            ).order_by('content_type')
            
            for item in type_counts:
                content_distribution.append({
                    'name': item['content_type'].capitalize(),
                    'value': item['count']
                })
        
        # Top performing content (using creation count as a proxy)
        top_content = []
        if 'engagement' in metrics or 'views' in metrics:
            top_items = filtered_content.annotate(
                score=Count('id')  # Using count as a simple score metric
            ).order_by('-score')[:5]
            
            for item in top_items:
                top_content.append({
                    'title': item.title,
                    'views': item.id % 1000 + 100  # Using a pseudo-view count for demo
                })
        
        # Create summary data
        summary = {
            'total_views': sum([item['views'] for item in top_content]) if top_content else 0,
            'new_users': User.objects.filter(date_joined__gte=timezone.now() - timedelta(days=30)).count(),
            'active_content': published_count,
            'engagement_rate': f"{(published_count / max(total_content, 1)) * 100:.0f}%" if total_content > 0 else "0%"
        }
        
        # Return the report data
        data = {
            'summary': summary,
            'views_over_time': views_over_time,
            'content_distribution': content_distribution,
            'top_content': top_content,
            'generated_at': timezone.now().isoformat(),
            'filters_applied': {
                'report_type': report_type,
                'date_from': date_from_str,
                'date_to': date_to_str,
                'content_type': content_type,
                'metrics': metrics
            }
        }
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)