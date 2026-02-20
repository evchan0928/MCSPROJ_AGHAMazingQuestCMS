from django.apps import AppConfig


class MobilemanagementConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.mobilemanagement'
    verbose_name = 'Mobile Management'
    
    def ready(self):
        import django.db.models.signals
        from django.contrib.auth.models import User
        from .models import UserProfile
        
        def create_user_profile(sender, instance, created, **kwargs):
            if created:
                UserProfile.objects.create(user=instance)
                
        django.db.models.signals.post_save.connect(create_user_profile, sender=User)