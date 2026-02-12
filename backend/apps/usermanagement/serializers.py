from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import MobileProfile, MobileScore, MobileBadge, MobileSession, MobileOTP

User = get_user_model()


class MobileProfileSerializer(serializers.ModelSerializer):
    mobile_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = MobileProfile
        fields = ('mobile_username', 'display_name', 'phone_number', 'avatar_url', 'metadata')


class MobileScoreSerializer(serializers.ModelSerializer):
    mobile_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = MobileScore
        fields = ('id', 'mobile_username', 'score', 'created_at')


class MobileBadgeSerializer(serializers.ModelSerializer):
    mobile_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = MobileBadge
        fields = ('id', 'mobile_username', 'badge_name', 'awarded_at', 'meta')


class MobileSessionSerializer(serializers.ModelSerializer):
    mobile_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = MobileSession
        fields = ('session_key', 'mobile_username', 'created_at', 'expires_at')


class MobileOTPSerializer(serializers.ModelSerializer):
    mobile_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = MobileOTP
        fields = ('id', 'mobile_username', 'email', 'code', 'created_at', 'expires_at', 'used')
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.models import Group

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    # Expose Django auth Groups under the name `roles` for clarity in the API
    roles = serializers.SlugRelatedField(many=True, slug_field='name', queryset=Group.objects.all(), source='groups')
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_staff', 'is_superuser', 'roles', 'password'
        )

    def create(self, validated_data):
        pw = validated_data.pop('password', None)
        groups = validated_data.pop('groups', [])
        user = User(**validated_data)
        if pw:
            user.set_password(pw)
        else:
            user.set_unusable_password()
        user.save()
        user.groups.set(groups)
        return user

    def update(self, instance, validated_data):
        pw = validated_data.pop('password', None)
        groups = validated_data.pop('groups', None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if pw:
            instance.set_password(pw)
        instance.save()
        if groups is not None:
            instance.groups.set(groups)
        return instance
