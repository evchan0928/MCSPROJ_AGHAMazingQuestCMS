from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class Command(BaseCommand):
    help = 'Reset admin user credentials'

    def handle(self, *args, **options):
        self.stdout.write('Resetting admin credentials...')
        
        # Check if admin user exists
        try:
            admin_user = User.objects.get(username='admin')
            self.stdout.write(f'Found existing admin user: {admin_user.username}')
            
            # Update the password
            admin_user.set_password('admin123')
            admin_user.email = 'admin@admin.com'
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
            self.stdout.write(
                self.style.SUCCESS('Updated existing admin user credentials.')
            )
            
        except User.DoesNotExist:
            self.stdout.write('Creating new admin user...')
            # Create a new admin user
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@admin.com',
                password='admin123',
                is_staff=True,
                is_active=True
            )
            self.stdout.write(
                self.style.SUCCESS('Created new admin user with credentials:')
            )
        
        self.stdout.write(f'Username: admin')
        self.stdout.write(f'Password: admin123')
        self.stdout.write(f'Email: admin@admin.com')
        self.stdout.write(
            self.style.SUCCESS('Admin credentials reset successfully!')
        )