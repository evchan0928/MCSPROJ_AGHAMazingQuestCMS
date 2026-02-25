from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
import os


def content_file_upload_to(instance, filename):
    """Custom upload path function to organize files by content type and date"""
    # Get the file extension
    ext = os.path.splitext(filename)[1]
    # Create a safe filename
    filename = f"{instance.title.replace(' ', '_')}_{timezone.now().strftime('%Y%m%d_%H%M%S')}{ext}"
    # Organize by content type and date
    return f'content_files/{instance.content_type}/{timezone.now().year}/{timezone.now().month:02d}/{filename}'


class ContentItem(models.Model):
    # Workflow states (storage values chosen for clarity)
    STATUS_FOR_EDITING = 'for_editing'        # Newly uploaded -> For editing
    STATUS_FOR_APPROVAL = 'for_approval'      # After editing -> For approval
    STATUS_FOR_PUBLISHING = 'for_publishing'  # After approval -> For publishing
    STATUS_PUBLISHED = 'published'            # After publishing -> Published
    STATUS_DELETED = 'deleted'                # Deleted

    STATUS_CHOICES = [
        (STATUS_FOR_EDITING, 'For editing'),
        (STATUS_FOR_APPROVAL, 'For approval'),
        (STATUS_FOR_PUBLISHING, 'For publishing'),
        (STATUS_PUBLISHED, 'Published'),
        (STATUS_DELETED, 'Deleted'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    body = models.TextField(blank=True)
    file = models.FileField(upload_to=content_file_upload_to, null=True, blank=True)
    
    # Additional fields for content management
    content_type = models.CharField(max_length=50, default='text', choices=[
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('document', 'Document'),
        ('trivia', 'Trivia Questions'),
    ])
    meta_keywords = models.TextField(blank=True)
    meta_description = models.TextField(blank=True)
    photo_caption = models.CharField(max_length=500, blank=True)
    highlights = models.TextField(blank=True)
    ar_marker = models.BooleanField(default=False)
    # `quiz` legacy removed; use `trivia_questions` for structured Q&A content
    enable_badges = models.BooleanField(default=False)
    chat_bot_allow = models.BooleanField(default=True)
    exclude_audio = models.BooleanField(default=False)

    # New: store trivia questions payload expected by mobile app
    # Each item: {"question": str, "choices": [str], "correctIndex": int, "category": str, "difficulty": str}
    trivia_questions = models.JSONField(default=list, blank=True, help_text="Array of trivia question objects for mobile clients")

    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_FOR_EDITING)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_content')
    created_at = models.DateTimeField(auto_now_add=True)

    edited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='edited_content')
    edited_at = models.DateTimeField(null=True, blank=True)

    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_content')
    approved_at = models.DateTimeField(null=True, blank=True)

    published_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='published_content')
    published_at = models.DateTimeField(null=True, blank=True)

    is_deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) if self.title else 'content'
            slug = base
            idx = 1
            
            # Prevent infinite loops by limiting attempts
            max_attempts = 1000
            while ContentItem.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                if idx > max_attempts:
                    # If we reach max attempts, add a random suffix
                    import uuid
                    slug = f"{base}-{uuid.uuid4().hex[:8]}"
                    break
                slug = f"{base}-{idx}"
                idx += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def transition_status(self, new_status, user=None):
        """Generic method to transition status and update relevant fields."""
        status_transitions = {
            self.STATUS_FOR_APPROVAL: {
                'status_field': 'edited',
                'timestamp_field': 'edited_at',
                'user_field': 'edited_by'
            },
            self.STATUS_FOR_PUBLISHING: {
                'status_field': 'approved',
                'timestamp_field': 'approved_at',
                'user_field': 'approved_by'
            },
            self.STATUS_PUBLISHED: {
                'status_field': 'published',
                'timestamp_field': 'published_at',
                'user_field': 'published_by'
            }
        }

        if new_status not in status_transitions:
            raise ValueError(f"Invalid status: {new_status}")

        # Update the appropriate fields based on the transition
        transition = status_transitions[new_status]
        setattr(self, transition['timestamp_field'], timezone.now())
        if user:
            setattr(self, transition['user_field'], user)
        self.status = new_status
        
        return self.save()