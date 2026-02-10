# Auto-generated initial migration for contentmanagement without Wagtail

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ContentItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('slug', models.SlugField(max_length=255, unique=True, blank=True)),
                ('body', models.TextField(blank=True)),
                ('file', models.FileField(upload_to='content_files/%Y/%m/%d', null=True, blank=True)),
                ('content_type', models.CharField(choices=[('text', 'Text'), ('image', 'Image'), ('video', 'Video'), ('document', 'Document'), ('quiz', 'Quiz')], default='text', max_length=50)),
                ('meta_keywords', models.TextField(blank=True)),
                ('meta_description', models.TextField(blank=True)),
                ('photo_caption', models.CharField(max_length=500, blank=True)),
                ('highlights', models.TextField(blank=True)),
                ('ar_marker', models.BooleanField(default=False)),
                ('quiz', models.BooleanField(default=False)),
                ('enable_badges', models.BooleanField(default=False)),
                ('chat_bot_allow', models.BooleanField(default=True)),
                ('exclude_audio', models.BooleanField(default=False)),
                ('quiz_length', models.IntegerField(null=True, blank=True, help_text='Number of questions in the quiz')),
                ('quiz_badges', models.CharField(choices=[('yes', 'Yes'), ('no', 'No')], default='no', help_text='Whether quiz awards badges', max_length=10)),
                ('quiz_number', models.IntegerField(null=True, blank=True, help_text='Quiz sequence number')),
                ('quiz_correct_answers', models.JSONField(default=dict, blank=True, help_text='Quiz correct answers: {1: "a", 2: "b", ...}')),
                ('status', models.CharField(choices=[('for_editing', 'For editing'), ('for_approval', 'For approval'), ('for_publishing', 'For publishing'), ('published', 'Published'), ('deleted', 'Deleted')], default='for_editing', max_length=32)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('edited_at', models.DateTimeField(null=True, blank=True)),
                ('approved_at', models.DateTimeField(null=True, blank=True)),
                ('published_at', models.DateTimeField(null=True, blank=True)),
                ('is_deleted', models.BooleanField(default=False)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_content', to=settings.AUTH_USER_MODEL)),
                ('edited_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='edited_content', to=settings.AUTH_USER_MODEL)),
                ('approved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='approved_content', to=settings.AUTH_USER_MODEL)),
                ('published_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='published_content', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
