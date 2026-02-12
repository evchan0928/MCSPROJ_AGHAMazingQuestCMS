from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomUserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.role_name}"

    class Meta:
        verbose_name = "Custom User Role"
        verbose_name_plural = "Custom User Roles"
        ordering = ["user__username", "role_name"]


# Mobile app related models
class MobileProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mobile_profile')
    display_name = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(max_length=30, blank=True)
    avatar_url = models.URLField(blank=True)
    metadata = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"Profile: {self.user.username}"


class MobileScore(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mobile_scores')
    score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.score}"


class MobileBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mobile_badges')
    badge_name = models.CharField(max_length=200)
    awarded_at = models.DateTimeField(auto_now_add=True)
    meta = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.badge_name}"


class MobileSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mobile_sessions')
    session_key = models.CharField(max_length=256, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Session {self.session_key} for {self.user.username}"


class MobileOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mobile_otps', null=True, blank=True)
    email = models.EmailField(blank=True)
    code = models.CharField(max_length=16)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def __str__(self):
        target = self.user.username if self.user else self.email
        return f"OTP for {target}: {self.code}"