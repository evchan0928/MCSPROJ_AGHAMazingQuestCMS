from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from apps.contentmanagement.models import Content  # Assuming this model exists
from apps.usermanagement.models import UserProfile  # Assuming this model exists
import random
import string

class Command(BaseCommand):
    help = 'Populates the database with a comprehensive RBAC dataset'

    def handle(self, *args, **options):
        # Define the roles based on the specification
        roles = ['Super Admin', 'Admin', 'Editor', 'Encoder', 'Approver']
        
        # Ensure all groups exist
        for role in roles:
            group, created = Group.objects.get_or_create(name=role)
            if created:
                self.stdout.write(f'Created group: {role}')
        
        # Create Super Admin User (with all permissions)
        super_admin_group = Group.objects.get(name='Super Admin')
        
        # Add all permissions to Super Admin
        all_permissions = Permission.objects.all()
        super_admin_group.permissions.set(all_permissions)
        
        super_admin_user, created = User.objects.get_or_create(
            username='superadmin',
            defaults={
                'email': 'superadmin@aghamazing.com',
                'first_name': 'Super',
                'last_name': 'Admin',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            super_admin_user.set_password('SuperPass123!')
            super_admin_user.save()
            super_admin_user.groups.add(super_admin_group)
            self.stdout.write(
                self.style.SUCCESS('Successfully created Super Admin user')
            )
        
        # Create Admin User
        admin_group = Group.objects.get(name='Admin')
        
        # Add admin-level permissions
        # We'll give them permissions to manage users, content, and other admin tasks
        user_content_types = ContentType.objects.filter(app_label='auth', model__in=['user', 'group'])
        content_content_types = ContentType.objects.filter(app_label='contentmanagement')
        
        for ct in user_content_types:
            perms = Permission.objects.filter(content_type=ct)
            admin_group.permissions.add(*perms)
            
        for ct in content_content_types:
            perms = Permission.objects.filter(content_type=ct)
            admin_group.permissions.add(*perms)
        
        admin_user, created = User.objects.get_or_create(
            username='adminuser',
            defaults={
                'email': 'admin@aghamazing.com',
                'first_name': 'Regular',
                'last_name': 'Admin',
                'is_staff': True
            }
        )
        if created:
            admin_user.set_password('AdminPass123!')
            admin_user.save()
            admin_user.groups.add(admin_group)
            self.stdout.write(
                self.style.SUCCESS('Successfully created Admin user')
            )
        
        # Create Editor User
        editor_group = Group.objects.get(name='Editor')
        
        # Give editors permissions to modify content but not users
        content_content_types = ContentType.objects.filter(app_label='contentmanagement')
        for ct in content_content_types:
            # Add add, change, and view permissions for content
            add_perm = Permission.objects.filter(content_type=ct, codename__startswith='add_').first()
            change_perm = Permission.objects.filter(content_type=ct, codename__startswith='change_').first()
            view_perm = Permission.objects.filter(content_type=ct, codename__startswith='view_').first()
            
            if add_perm:
                editor_group.permissions.add(add_perm)
            if change_perm:
                editor_group.permissions.add(change_perm)
            if view_perm:
                editor_group.permissions.add(view_perm)
        
        editor_user, created = User.objects.get_or_create(
            username='editoruser',
            defaults={
                'email': 'editor@aghamazing.com',
                'first_name': 'Content',
                'last_name': 'Editor',
                'is_staff': True
            }
        )
        if created:
            editor_user.set_password('EditorPass123!')
            editor_user.save()
            editor_user.groups.add(editor_group)
            self.stdout.write(
                self.style.SUCCESS('Successfully created Editor user')
            )
        
        # Create Encoder User
        encoder_group = Group.objects.get(name='Encoder')
        
        # Give encoders permissions to add and change content but not publish
        content_content_types = ContentType.objects.filter(app_label='contentmanagement')
        for ct in content_content_types:
            # Add add and change permissions but not delete
            add_perm = Permission.objects.filter(content_type=ct, codename__startswith='add_').first()
            change_perm = Permission.objects.filter(content_type=ct, codename__startswith='change_').first()
            
            if add_perm:
                encoder_group.permissions.add(add_perm)
            if change_perm:
                encoder_group.permissions.add(change_perm)
        
        encoder_user, created = User.objects.get_or_create(
            username='encoderuser',
            defaults={
                'email': 'encoder@aghamazing.com',
                'first_name': 'Content',
                'last_name': 'Encoder',
                'is_staff': True
            }
        )
        if created:
            encoder_user.set_password('EncoderPass123!')
            encoder_user.save()
            encoder_user.groups.add(encoder_group)
            self.stdout.write(
                self.style.SUCCESS('Successfully created Encoder user')
            )
        
        # Create Approver User
        approver_group = Group.objects.get(name='Approver')
        
        # Give approvers permissions to view and change content status/publish
        content_content_types = ContentType.objects.filter(app_label='contentmanagement')
        for ct in content_content_types:
            # Add view and change permissions for approval purposes
            change_perm = Permission.objects.filter(content_type=ct, codename__startswith='change_').first()
            view_perm = Permission.objects.filter(content_type=ct, codename__startswith='view_').first()
            
            if change_perm:
                approver_group.permissions.add(change_perm)
            if view_perm:
                approver_group.permissions.add(view_perm)
        
        approver_user, created = User.objects.get_or_create(
            username='approveruser',
            defaults={
                'email': 'approver@aghamazing.com',
                'first_name': 'Content',
                'last_name': 'Approver',
                'is_staff': True
            }
        )
        if created:
            approver_user.set_password('ApproverPass123!')
            approver_user.save()
            approver_user.groups.add(appprover_group)
            self.stdout.write(
                self.style.SUCCESS('Successfully created Approver user')
            )
        
        # Create sample content for testing
        self.create_sample_content()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully populated RBAC dataset with users for all roles')
        )

    def create_sample_content(self):
        """Create sample content for testing purposes"""
        try:
            # Import content model dynamically to avoid circular imports
            from apps.contentmanagement.models import Content
            
            # Create some sample content
            sample_contents = [
                {'title': 'Sample Article 1', 'content': 'This is a sample article content', 'status': 'draft'},
                {'title': 'Sample Article 2', 'content': 'This is another sample article', 'status': 'pending_approval'},
                {'title': 'Sample Article 3', 'content': 'This is a published article', 'status': 'published'},
                {'title': 'Sample Article 4', 'content': 'This article needs review', 'status': 'needs_review'},
            ]
            
            for content_data in sample_contents:
                content_obj, created = Content.objects.get_or_create(
                    title=content_data['title'],
                    defaults={
                        'content': content_data['content'],
                        'status': content_data['status']
                    }
                )
                
                if created:
                    self.stdout.write(f'Created content: {content_data["title"]}')
                    
        except ImportError:
            self.stdout.write('Content model not found, skipping sample content creation')
        except Exception as e:
            self.stdout.write(f'Error creating sample content: {str(e)}')