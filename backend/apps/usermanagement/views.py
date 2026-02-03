from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
from wagtail.models import Page
from apps.contentmanagement.models import ContentItem
from .models import CustomUserRole  # Changed to import from the local models module
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
        published_count = ContentItem.objects.filter(status='published').count()
        
        # Get pending approval count
        pending_approval_count = ContentItem.objects.filter(status='pending').count()
        
        # Get active users count
        active_users_count = User.objects.filter(is_active=True).count()
        
        # Get notifications count (for now, returning 0 - this would come from a notifications model in the future)
        notifications_count = 0
        
        stats_data = {
            'published': published_count,
            'pendingApproval': pending_approval_count,
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
            # Get the author information
            author_name = item.author.get_full_name() if item.author.get_full_name() else item.author.username
            
            content_list.append({
                'id': item.id,
                'title': item.title,
                'timestamp': item.created_at.strftime('%d-%B-%Y | %H:%M %p'),
                'encoded_by': author_name,
                'reviewed_by': 'Auto-assigned' if not item.reviewer else item.reviewer.get_full_name(),
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
            for role_name in roles:
                if isinstance(role_name, str):
                    role, created = CustomUserRole.objects.get_or_create(
                        user=user,
                        role_name=role_name
                    )
                elif isinstance(role_name, dict):
                    role, created = CustomUserRole.objects.get_or_create(
                        user=user,
                        role_name=role_name.get('name', role_name.get('role_name', ''))
                    )
            
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


@api_view(['GET', 'PUT', 'DELETE'])
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
    
    elif request.method == 'PUT':
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
    # Create a list of roles with synthetic IDs (position-based)
    role_list = []
    for idx, role in enumerate(roles):
        # Get a representative role object to use its actual ID
        actual_role_obj = CustomUserRole.objects.filter(role_name=role['role_name']).first()
        role_list.append({
            'id': actual_role_obj.id,
            'name': actual_role_obj.role_name
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
        if CustomUserRole.objects.filter(role_name=role_name).exists():
            return JsonResponse({'error': 'Role already exists'}, status=400)
        
        # Create the role with a placeholder user (we'll use the requesting user)
        role = CustomUserRole.objects.create(
            user=request.user,  # Use the current logged-in user as a placeholder
            role_name=role_name
        )
        
        response_data = {
            'id': role.id,
            'name': role.role_name
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
        # Find all role instances with this role name
        role_instances = CustomUserRole.objects.filter(id=role_id)
        if not role_instances.exists():
            return JsonResponse({'error': 'Role not found.'}, status=404)
        
        # Get the role name from any instance
        role_name = role_instances.first().role_name
    except CustomUserRole.DoesNotExist:
        return JsonResponse({'error': 'Role not found.'}, status=404)
    
    if request.method == 'GET':
        # Return role details
        role_info = {
            'id': role_id,
            'name': role_name,
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
            if CustomUserRole.objects.filter(role_name=new_name).exclude(id=role_id).exists():
                return JsonResponse({'error': 'A role with this name already exists'}, status=400)
            
            # Update all instances of this role
            CustomUserRole.objects.filter(id=role_id).update(role_name=new_name)
            
            role_info = {
                'id': role_id,
                'name': new_name,
            }
            
            return JsonResponse(role_info)
        
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == 'DELETE':
        # Delete all instances of this role
        CustomUserRole.objects.filter(id=role_id).delete()
        return JsonResponse({'message': 'Role deleted successfully.'})
    
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)