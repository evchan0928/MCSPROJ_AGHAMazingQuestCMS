from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User, Group
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
from apps.contentmanagement.models import ContentItem
from .models import CustomUserRole  # Import the custom user role model
from django.db.models import Count, Q
import json

# Import DRF decorators for JWT authentication
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework import status

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    """
    API endpoint to get dashboard statistics
    """
    try:
        # Get published content count
        published_count = ContentItem.objects.filter(status=ContentItem.STATUS_PUBLISHED).count()
        
        # Get pending approval count (corrected from 'pending' to the actual status)
        pending_approval_count = ContentItem.objects.filter(status=ContentItem.STATUS_FOR_APPROVAL).count()
        
        # Get content in editing count
        content_in_editing_count = ContentItem.objects.filter(status=ContentItem.STATUS_FOR_EDITING).count()
        
        # Get total content count
        total_content_count = ContentItem.objects.count()
        
        # Get recently published content count (published in the last 7 days)
        seven_days_ago = timezone.now() - timezone.timedelta(days=7)
        recently_published_count = ContentItem.objects.filter(
            status=ContentItem.STATUS_PUBLISHED,
            created_at__gte=seven_days_ago
        ).count()
        
        # Get active users count
        active_users_count = User.objects.filter(is_active=True).count()
        
        # Get notifications count (for now, returning 0 - this would come from a notifications model in the future)
        notifications_count = 0
        
        stats_data = {
            'published': published_count,
            'pendingApproval': pending_approval_count,
            'contentInEditing': content_in_editing_count,
            'totalContent': total_content_count,
            'recentlyPublished': recently_published_count,
            'activeUsers': active_users_count,
            'notifications': notifications_count
        }
        
        return Response(stats_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recent_content(request):
    """
    API endpoint to get recent content items
    """
    try:
        # Get the 10 most recently created content items
        recent_content = ContentItem.objects.order_by('-created_at')[:10]
        
        content_list = []
        for item in recent_content:
            # Get the creator information
            creator_name = item.created_by.get_full_name() if item.created_by and item.created_by.get_full_name() else (item.created_by.username if item.created_by else 'Unknown')
            
            content_list.append({
                'id': item.id,
                'title': item.title,
                'content_type': item.content_type,
                'created_at': item.created_at.isoformat(),
                'created_by': {
                    'username': item.created_by.username if item.created_by else 'Unknown',
                    'full_name': item.created_by.get_full_name() if item.created_by and item.created_by.get_full_name() else ''
                },
                'status': item.get_status_display(),  # Using the display value of the status choice
            })
        
        return Response(content_list, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_list_view(request):
    """View to list, create, or retrieve users."""
    if request.method == 'GET':
        # Return a list of all users with basic info
        users = User.objects.all()
        user_data = []
        for user in users:
            user_info = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                'last_login': user.last_login.isoformat() if user.last_login else None,
            }
            
            # Add role information if available
            try:
                custom_roles = CustomUserRole.objects.filter(user=user)
                user_info['roles'] = [{'id': role.id, 'name': role.role_name} for role in custom_roles]
            except CustomUserRole.DoesNotExist:
                user_info['roles'] = []
                
            user_data.append(user_info)
        
        return Response(user_data)
    
    elif request.method == 'POST':
        # Create a new user
        try:
            data = request.data
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            is_active = data.get('is_active', True)
            is_staff = data.get('is_staff', False)
            is_superuser = data.get('is_superuser', False)
            roles = data.get('roles', [])
            
            # Validate required fields
            if not username or not email or not password:
                return Response({'error': 'Username, email, and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate password
            try:
                validate_password(password)
            except ValidationError as e:
                return Response({'error': e.messages[0]}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                return Response({'error': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create the user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_active=is_active,
                is_staff=is_staff,
                is_superuser=is_superuser
            )
            
            # Assign roles if provided
            if roles:
                if not isinstance(roles, list):
                    return Response({'error': 'Roles must be a list.'}, status=status.HTTP_400_BAD_REQUEST)
                
                groups = []
                for role_item in roles:
                    role_name = role_item
                    if isinstance(role_item, dict):
                        role_name = role_item.get('name', role_item.get('role_name', ''))
                    
                    if role_name:
                        # Get or create the group
                        group, created = Group.objects.get_or_create(name=role_name)
                        groups.append(group)
                
                # Assign all groups to the user
                if groups:
                    user.groups.set(groups)
            
            # Return the created user data
            user_info = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                'last_login': user.last_login.isoformat() if user.last_login else None,
            }
            
            # Add role information
            user_roles = CustomUserRole.objects.filter(user=user)
            user_info['roles'] = [{'id': role.id, 'name': role.role_name} for role in user_roles]
            
            return Response(user_info, status=status.HTTP_201_CREATED)
        
        except ValidationError as e:
            return Response({'error': e.messages[0]}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_detail_view(request, user_id):
    """View to retrieve, update, or delete a specific user."""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)
    
    if request.method == 'GET':
        # Return user details
        user_info = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'date_joined': user.date_joined.isoformat() if user.date_joined else None,
            'last_login': user.last_login.isoformat() if user.last_login else None,
        }
        
        # Add role information
        user_roles = CustomUserRole.objects.filter(user=user)
        user_info['roles'] = [{'id': role.id, 'name': role.role_name} for role in user_roles]
        
        return JsonResponse(user_info)
    
    elif request.method in ('PUT', 'PATCH'):
        # Update user details
        try:
            data = json.loads(request.body)
            
            # Update fields if provided
            if 'username' in data:
                username = data['username']
                # Check if username is already taken by another user
                if User.objects.filter(username=username).exclude(id=user_id).exists():
                    return JsonResponse({'error': 'Username already exists.'}, status=400)
                user.username = username
            
            if 'email' in data:
                email = data['email']
                # Check if email is already taken by another user
                if User.objects.filter(email=email).exclude(id=user_id).exists():
                    return JsonResponse({'error': 'Email already exists.'}, status=400)
                user.email = email
            
            if 'first_name' in data:
                user.first_name = data['first_name']
            
            if 'last_name' in data:
                user.last_name = data['last_name']
            
            if 'is_active' in data:
                user.is_active = data['is_active']
            
            if 'is_staff' in data:
                user.is_staff = data['is_staff']
            
            if 'is_superuser' in data:
                user.is_superuser = data['is_superuser']
            
            # Update password if provided
            if 'password' in data and data['password']:
                try:
                    validate_password(data['password'])
                    user.password = make_password(data['password'])
                except ValidationError as e:
                    return JsonResponse({'error': e.messages[0]}, status=400)
            
            # Update roles if provided
            if 'roles' in data:
                roles = data['roles']
                # Clear existing roles
                CustomUserRole.objects.filter(user=user).delete()
                
                # Add new roles
                for role_name in roles:
                    if isinstance(role_name, str):
                        CustomUserRole.objects.get_or_create(user=user, role_name=role_name)
                    elif isinstance(role_name, dict):
                        CustomUserRole.objects.get_or_create(
                            user=user,
                            role_name=role_name.get('name', role_name.get('role_name', ''))
                        )

                # Synchronize Django Groups for permission checks
                try:
                    group_names = []
                    for r in roles:
                        if isinstance(r, str):
                            group_names.append(r)
                        elif isinstance(r, dict):
                            group_names.append(r.get('name', r.get('role_name', '')))

                    groups = []
                    for name in set([n for n in group_names if n]):
                        g, _ = Group.objects.get_or_create(name=name)
                        groups.append(g)
                    # Set user's groups to match roles
                    user.groups.set(groups)
                except Exception:
                    pass
            
            user.save()
            
            # Return updated user data
            user_info = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                'last_login': user.last_login.isoformat() if user.last_login else None,
            }
            
            # Add role information
            user_roles = CustomUserRole.objects.filter(user=user)
            user_info['roles'] = [{'id': role.id, 'name': role.role_name} for role in user_roles]
            
            return JsonResponse(user_info)
        
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
        except ValidationError as e:
            return JsonResponse({'error': e.messages[0]}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == 'DELETE':
        # Delete the user
        user.delete()
        return JsonResponse({'message': 'User deleted successfully.'})
    
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_roles_view(request):
    """View to get all available roles."""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Get all unique role names from the CustomUserRole model
    roles = CustomUserRole.objects.values('role_name').distinct()
    # Get all Django Groups (roles)
    groups = Group.objects.all()
    
    # Create a list of roles
    role_list = []
    for group in groups:
        role_list.append({
            'id': group.id,
            'name': group.name
        })
    
    return JsonResponse(role_list, safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_role_view(request):
    """View to create a new role."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        role_name = data.get('name')
        
        if not role_name:
            return JsonResponse({'error': 'Role name is required'}, status=400)
        
        # Check if role already exists
        if Group.objects.filter(name=role_name).exists():
            return JsonResponse({'error': 'Role already exists'}, status=400)
        
        # Create the group
        group = Group.objects.create(name=role_name)
        
        response_data = {
            'id': group.id,
            'name': group.name
        }
        
        return JsonResponse(response_data, status=201)
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def role_detail_view(request, role_id):
    """View to retrieve, update, or delete a specific role."""
    try:
        group = Group.objects.get(id=role_id)
    except Group.DoesNotExist:
        return JsonResponse({'error': 'Role not found.'}, status=404)
    
    if request.method == 'GET':
        # Return role details
        role_info = {
            'id': group.id,
            'name': group.name,
        }
        return JsonResponse(role_info)
    
    elif request.method == 'PUT':
        # Update role name
        try:
            data = json.loads(request.body)
            new_name = data.get('name')
            
            if not new_name:
                return JsonResponse({'error': 'Role name is required'}, status=400)
            
            # Check if the new name already exists
            if Group.objects.filter(name=new_name).exclude(id=role_id).exists():
                return JsonResponse({'error': 'A role with this name already exists'}, status=400)
            
            # Update the group name
            group.name = new_name
            group.save()
            
            role_info = {
                'id': group.id,
                'name': group.name,
            }
            
            return JsonResponse(role_info)
        
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == 'DELETE':
        # Delete the group
        group.delete()
        return JsonResponse({'message': 'Role deleted successfully.'}, status=204)
    
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)