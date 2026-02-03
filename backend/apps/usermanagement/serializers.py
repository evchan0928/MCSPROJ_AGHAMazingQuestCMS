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
