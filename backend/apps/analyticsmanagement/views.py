from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta, datetime
from apps.contentmanagement.models import ContentItem
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.http import HttpResponse
import json
import io
import csv


@api_view(['GET'])
def get_analytics_summary(request):
    """Get basic analytics summary for the content management system."""
    try:
        User = get_user_model()
        
        # Calculate metrics directly from database
        total_users = User.objects.count()
        total_content_items = ContentItem.objects.count()
        published_content = ContentItem.objects.filter(status=ContentItem.STATUS_PUBLISHED).count()
        
        # Get all content with details (Name, Author, Status, Date)
        all_content = ContentItem.objects.select_related('created_by').values(
            'id', 'title', 'status', 'created_at', 'created_by__username'
        ).order_by('-created_at')
        
        content_list = []
        for item in all_content:
            content_list.append({
                'id': item['id'],
                'name': item['title'],
                'author': item['created_by__username'] or 'Unknown',
                'status': item['status'],
                'date': item['created_at'].isoformat() if item['created_at'] else None,
            })
        
        data = {
            'summary': {
                'total_users': total_users,
                'total_content': total_content_items,
                'published_content': published_content,
                'timestamp': timezone.now().isoformat(),
            },
            'content': content_list
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
        
        data = {
            'content_by_status': content_by_status,
            'timestamp': timezone.now().isoformat(),
        }
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
