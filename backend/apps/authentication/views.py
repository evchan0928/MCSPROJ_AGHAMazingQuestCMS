from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.forms import PasswordResetForm

from .serializers import RegisterSerializer, UserSerializer


class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class PasswordResetView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if user exists or not for security
            return Response({'message': 'Password reset link sent to your email'}, status=status.HTTP_200_OK)

        # Generate password reset token and uid
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Create reset link (you might want to customize this URL)
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/" if hasattr(settings, 'FRONTEND_URL') else f"http://localhost:3000/reset-password/{uid}/{token}/"

        # Send email
        subject = 'Password Reset Request'
        message = render_to_string('authentication/password_reset_email.html', {
            'user': user,
            'reset_link': reset_link,
        })
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
            html_message=message
        )

        return Response({'message': 'Password reset link sent to your email'}, status=status.HTTP_200_OK)
