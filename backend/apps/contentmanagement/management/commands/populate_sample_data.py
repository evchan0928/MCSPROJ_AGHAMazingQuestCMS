from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from apps.contentmanagement.models import ContentItem
import random
import os

class Command(BaseCommand):
    help = 'Populate the database with sample content data for demonstration'

    def handle(self, *args, **options):
        # Get or create a default user for content creation
        default_user, created = User.objects.get_or_create(
            username='demo_user',
            defaults={
                'first_name': 'Demo',
                'last_name': 'User',
                'email': 'demo@example.com',
                'is_active': True
            }
        )
        
        if created:
            default_user.set_password('demopass123')
            default_user.save()
            self.stdout.write(self.style.SUCCESS(f'Created demo user: {default_user.username}'))

        # Sample content titles and descriptions
        sample_titles = [
            "Introduction to PostgreSQL",
            "Advanced Django Techniques",
            "Wagtail CMS Best Practices",
            "Educational Content Management",
            "Database Migration Strategies",
            "User Authentication Systems",
            "Content Workflow Management",
            "API Integration Patterns",
            "Data Integrity in Applications",
            "Performance Optimization Tips"
        ]
        
        sample_descriptions = [
            "Comprehensive guide to PostgreSQL features and capabilities.",
            "Deep dive into advanced Django development techniques.",
            "Best practices for managing content with Wagtail CMS.",
            "Strategies for educational content organization.",
            "Step-by-step database migration procedures.",
            "Implementing robust authentication systems.",
            "Workflow patterns for content approval processes.",
            "Effective API integration methodologies.",
            "Ensuring data integrity across applications.",
            "Techniques for optimizing application performance."
        ]
        
        sample_highlights = [
            "Key features and benefits",
            "Implementation guidelines",
            "Common challenges and solutions",
            "Performance considerations",
            "Security best practices",
            "Scalability factors",
            "Integration possibilities",
            "Maintenance requirements",
            "Monitoring recommendations",
            "Future enhancements"
        ]
        
        # Content types available in the model
        content_types = ['text', 'image', 'video', 'document', 'trivia']
        
        # Status options from the model
        statuses = [
            ContentItem.STATUS_FOR_EDITING,
            ContentItem.STATUS_FOR_APPROVAL,
            ContentItem.STATUS_FOR_PUBLISHING,
            ContentItem.STATUS_PUBLISHED,
            ContentItem.STATUS_DELETED
        ]
        
        # Create 20 sample content items
        created_count = 0
        for i in range(20):
            title = f"{random.choice(sample_titles)} #{i+1}"
            description = random.choice(sample_descriptions)
            highlight = random.choice(sample_highlights)
            content_type = random.choice(content_types)
            status = random.choice(statuses)
            
            # Skip creating if already exists
            if ContentItem.objects.filter(title=title).exists():
                continue
                
            content_item = ContentItem(
                title=title,
                body=f"This is the body content for {title}. {description}",
                content_type=content_type,
                meta_keywords=f"postgresql,django,wagtail,content,education,{title.replace(' ', ',').lower()}",
                meta_description=description,
                photo_caption=f"Caption for {title}",
                highlights=highlight,
                ar_marker=random.choice([True, False]),
                # legacy `quiz` removed; trivia content represented by `trivia_questions`
                enable_badges=random.choice([True, False]),
                chat_bot_allow=random.choice([True, False]),
                exclude_audio=random.choice([True, False]),
                status=status,
                created_by=default_user
            )
            
            # Save the content item
            content_item.save()
            created_count += 1
            
            # Apply some status transitions based on the workflow
            if status == ContentItem.STATUS_FOR_APPROVAL:
                content_item.send_for_approval(user=default_user)
            elif status == ContentItem.STATUS_FOR_PUBLISHING:
                content_item.send_for_approval(user=default_user)
                content_item.approve(user=default_user)
            elif status == ContentItem.STATUS_PUBLISHED:
                content_item.send_for_approval(user=default_user)
                content_item.approve(user=default_user)
                content_item.publish(user=default_user)
        
        # Create additional users with different roles and assign Group
        roles = ['Encoder', 'Editor', 'Approver', 'Admin', 'Super Admin']
        for role_name in roles:
            user, created = User.objects.get_or_create(
                username=f'{role_name.lower()}_user',
                defaults={
                    'first_name': role_name,
                    'last_name': 'User',
                    'email': f'{role_name.lower()}@example.com',
                    'is_active': True
                }
            )
            
            if created:
                user.set_password('demopass123')
                user.save()
                
                # Create group mapping
                group, _ = Group.objects.get_or_create(name=role_name)
                user.groups.add(group)
                
                self.stdout.write(self.style.SUCCESS(f'Created {role_name} user: {user.username}'))
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully populated the database with {created_count} sample content items and {len(roles)+1} users.')
        )