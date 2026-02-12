from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
from apps.contentmanagement.models import ContentItem
from .models import CustomUserRole, MobileProfile, MobileScore, MobileBadge, MobileSession, MobileOTP
from django.contrib.auth.models import Group
from django.db.models import Count, Q
import json

# Import DRF decorators for JWT authentication
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework import status
import uuid
import random
from datetime import timedelta
from django.utils import timezone
from rest_framework.permissions import AllowAny
from .serializers import (
    MobileProfileSerializer,
    MobileScoreSerializer,
    MobileBadgeSerializer,
    MobileSessionSerializer,
    MobileOTPSerializer,
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model

UserModel = get_user_model()

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

            # Also synchronize Django Groups for permission checks
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
                if groups:
                    user.groups.set(groups)
            except Exception:
                # Non-fatal: continue even if group sync fails
                pass
            
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


# ----------------------
# Mobile API endpoints
# ----------------------


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def mobile_profile_view(request):
    user = request.user
    try:
        profile, _ = MobileProfile.objects.get_or_create(user=user)
    except Exception:
        return Response({'error': 'Failed to get or create profile.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if request.method == 'GET':
        serializer = MobileProfileSerializer(profile)
        data = serializer.data
        # Expose mobile_username key for compatibility
        data['mobile_username'] = user.username
        return Response(data)

    # PUT
    serializer = MobileProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def mobile_score_view(request):
    user = request.user
    if request.method == 'POST':
        serializer = MobileScoreSerializer(data=request.data)
        # allow client to supply score only; attach user server-side
        if serializer.is_valid():
            MobileScore.objects.create(user=user, score=serializer.validated_data.get('score', 0))
            return Response({'message': 'Score recorded'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # GET: return recent scores for user
    scores = MobileScore.objects.filter(user=user).order_by('-created_at')[:50]
    serializer = MobileScoreSerializer(scores, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def mobile_leaderboard_view(request):
    # Aggregate top users by total score
    from django.db.models import Sum

    agg = MobileScore.objects.values('user__id', 'user__username').annotate(total=Sum('score')).order_by('-total')[:50]
    leaderboard = [{'user_id': e['user__id'], 'username': e['user__username'], 'total': e['total']} for e in agg]
    return Response({'leaderboard': leaderboard})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mobile_badges_view(request):
    user = request.user
    badges = MobileBadge.objects.filter(user=user).order_by('-awarded_at')
    serializer = MobileBadgeSerializer(badges, many=True)
    return Response(serializer.data)


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def mobile_session_view(request):
    user = request.user
    if request.method == 'POST':
        key = str(uuid.uuid4())
        expires = timezone.now() + timedelta(days=7)
        session = MobileSession.objects.create(user=user, session_key=key, expires_at=expires)
        serializer = MobileSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # DELETE: accept JSON {"session_key": "..."}
    data = request.data
    key = data.get('session_key')
    if not key:
        return Response({'error': 'session_key required'}, status=status.HTTP_400_BAD_REQUEST)
    MobileSession.objects.filter(user=user, session_key=key).delete()
    return Response({'message': 'session ended'})


@api_view(['POST', 'PUT'])
@permission_classes([AllowAny])
def mobile_otp_view(request):
    # POST -> store OTP (mobile backend will generate/send/verify)
    if request.method == 'POST':
        # Accept OTP records from mobile backend for storage/audit
        email = request.data.get('email')
        code = request.data.get('code')
        expires_at = request.data.get('expires_at')
        username = request.data.get('username')
        user = None
        if username:
            try:
                user = UserModel.objects.get(username=username)
            except UserModel.DoesNotExist:
                user = None

        if not email or not code:
            return Response({'error': 'email and code required'}, status=status.HTTP_400_BAD_REQUEST)

        # allow client to supply expires_at as ISO string; otherwise default 10 minutes
        try:
            if expires_at:
                expires = timezone.datetime.fromisoformat(expires_at)
            else:
                expires = timezone.now() + timedelta(minutes=10)
        except Exception:
            expires = timezone.now() + timedelta(minutes=10)

        otp = MobileOTP.objects.create(user=user, email=email, code=code, expires_at=expires)
        serializer = MobileOTPSerializer(otp)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # PUT -> mark OTP used/consumed (mobile backend notifies CMS)
    code = request.data.get('code')
    email = request.data.get('email')
    if not code or not email:
        return Response({'error': 'code and email required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        otp = MobileOTP.objects.filter(code=code, email=email, used=False).order_by('-created_at').first()
        if not otp:
            return Response({'error': 'OTP not found'}, status=status.HTTP_404_NOT_FOUND)
        otp.used = True
        otp.save()
        return Response({'message': 'marked used'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # PUT -> verify OTP
    code = request.data.get('code')
    email = request.data.get('email')
    if not code or not email:
        return Response({'error': 'code and email required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        otp = MobileOTP.objects.filter(code=code, email=email, used=False).order_by('-created_at').first()
        if not otp:
            return Response({'error': 'Invalid or expired code'}, status=status.HTTP_400_BAD_REQUEST)
        if otp.expires_at < timezone.now():
            return Response({'error': 'Expired code'}, status=status.HTTP_400_BAD_REQUEST)
        otp.used = True
        otp.save()
        return Response({'message': 'verified'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def mobile_tokens_view(request):
    # Accept username/password and return JWT tokens (same as login)
    identifier = request.data.get('identifier') or request.data.get('username') or request.data.get('email')
    password = request.data.get('password')
    if not identifier or not password:
        return Response({'error': 'identifier (username or email) and password required'}, status=status.HTTP_400_BAD_REQUEST)

    # If identifier looks like email, resolve username
    username = identifier
    if '@' in identifier:
        try:
            u = UserModel.objects.get(email=identifier)
            username = u.username
        except UserModel.DoesNotExist:
            return Response({'error': 'invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = TokenObtainPairSerializer(data={'username': username, 'password': password})
    try:
        serializer.is_valid(raise_exception=True)
    except Exception:
        return Response({'error': 'invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.validated_data)


@api_view(['POST'])
@permission_classes([AllowAny])
def mobile_register_view(request):
    # Register mobile user using email + password. Username optional.
    data = request.data
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    first_name = data.get('first_name', '')
    last_name = data.get('last_name', '')

    if not email or not password:
        return Response({'error': 'email and password required'}, status=status.HTTP_400_BAD_REQUEST)

    if UserModel.objects.filter(email=email).exists():
        return Response({'error': 'email already exists'}, status=status.HTTP_400_BAD_REQUEST)

    if not username:
        base = email.split('@', 1)[0]
        candidate = base
        i = 1
        while UserModel.objects.filter(username=candidate).exists():
            candidate = f"{base}{i}"
            i += 1
        username = candidate

    try:
        user = UserModel.objects.create_user(username=username, email=email, password=password, first_name=first_name, last_name=last_name)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'id': user.id, 'username': user.username, 'email': user.email}, status=status.HTTP_201_CREATED)


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

        # Ensure a corresponding Django Group exists for permissions
        try:
            Group.objects.get_or_create(name=role_name)
        except Exception:
            pass
        
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