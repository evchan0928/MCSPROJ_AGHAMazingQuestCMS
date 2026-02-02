from django.db import models
from django.contrib.auth.models import User

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