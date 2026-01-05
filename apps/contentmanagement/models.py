from django.db import models
from wagtail.models import Page
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify

class HomePage(Page):
    pass

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
    file = models.FileField(upload_to='content_files/%Y/%m/%d', null=True, blank=True)

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
            while ContentItem.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{idx}"
                idx += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def send_for_approval(self, user=None):
        # Move from For editing -> For approval
        self.status = self.STATUS_FOR_APPROVAL
        self.edited_at = timezone.now()
        if user:
            self.edited_by = user
        self.save(update_fields=['status', 'edited_at', 'edited_by'])

    def approve(self, user=None):
        # Move from For approval -> For publishing
        self.status = self.STATUS_FOR_PUBLISHING
        self.approved_at = timezone.now()
        if user:
            self.approved_by = user
        self.save(update_fields=['status', 'approved_at', 'approved_by'])

    def publish(self, user=None):
        # Move from For publishing -> Published
        self.status = self.STATUS_PUBLISHED
        self.published_at = timezone.now()
        if user:
            self.published_by = user
        self.save(update_fields=['status', 'published_at', 'published_by'])

    def soft_delete(self, user=None):
        self.is_deleted = True
        self.status = self.STATUS_DELETED
        self.save(update_fields=['is_deleted', 'status'])

    def __str__(self):
        return f"{self.title} ({self.status})"
