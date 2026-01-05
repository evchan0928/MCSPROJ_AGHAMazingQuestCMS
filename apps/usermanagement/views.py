from django.shortcuts import render
from rest_framework import viewsets
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

User = get_user_model()


class IsAdminOrSuperuser(IsAuthenticated):
	def has_permission(self, request, view):
		if not super().has_permission(request, view):
			return False
		# allow only superusers or users in Admin/Super Admin groups
		# request.user.groups is a RelatedManager; use values_list to avoid
		# accidentally iterating the manager itself (which raises TypeError).
		if request.user.is_superuser:
			return True
		# Use values_list for an efficient DB-level fetch of group names
		names = set(request.user.groups.values_list('name', flat=True))
		return ('Admin' in names) or ('Super Admin' in names)


class UserViewSet(viewsets.ModelViewSet):
	queryset = User.objects.all()
	serializer_class = UserSerializer
	permission_classes = [IsAdminOrSuperuser]


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import Group
import logging
import sys


class RoleListView(APIView):
	"""Return list of roles (Django auth Groups) for the admin UI.

	NOTE: For diagnosis this view temporarily allows any requester so we can
	determine whether the 404/Not found seen in the frontend is a permission
	issue vs a routing/proxy issue. This change should be reverted after
	diagnosis (or replaced with proper client auth)."""
	permission_classes = [IsAdminOrSuperuser]

	def get(self, request):
		# Diagnostic response: return the request's authorization header and
		# basic user info so the client-side can see what the server received.
		auth_hdr = request.META.get('HTTP_AUTHORIZATION')
		try:
			user_info = {
				'is_authenticated': bool(getattr(request.user, 'is_authenticated', False)),
				'username': getattr(request.user, 'username', None),
				'is_superuser': bool(getattr(request.user, 'is_superuser', False)),
			}
		except Exception:
			user_info = {'error': 'could not read user'}

		# Return the canonical list of roles for the UI.
		roles = Group.objects.all().order_by('name')
		data = [{'id': g.id, 'name': g.name} for g in roles]
		return Response(data)

