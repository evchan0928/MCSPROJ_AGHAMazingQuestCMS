from django.contrib import admin
from .models import ContentItem


@admin.register(ContentItem)
class ContentItemAdmin(admin.ModelAdmin):
	list_display = ('title', 'status', 'created_by', 'created_at')
	search_fields = ('title', 'body', 'slug')
	list_filter = ('status', 'created_at')
