from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    initial = False

    dependencies = [
        ('usermanagement', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='MobileProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('display_name', models.CharField(blank=True, max_length=150)),
                ('phone_number', models.CharField(blank=True, max_length=30)),
                ('avatar_url', models.URLField(blank=True)),
                ('metadata', models.JSONField(blank=True, null=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='mobile_profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),

        migrations.CreateModel(
            name='MobileScore',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='mobile_scores', to=settings.AUTH_USER_MODEL)),
            ],
        ),

        migrations.CreateModel(
            name='MobileBadge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('badge_name', models.CharField(max_length=200)),
                ('awarded_at', models.DateTimeField(auto_now_add=True)),
                ('meta', models.JSONField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='mobile_badges', to=settings.AUTH_USER_MODEL)),
            ],
        ),

        migrations.CreateModel(
            name='MobileSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('session_key', models.CharField(max_length=256, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='mobile_sessions', to=settings.AUTH_USER_MODEL)),
            ],
        ),

        migrations.CreateModel(
            name='MobileOTP',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('code', models.CharField(max_length=16)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField()),
                ('used', models.BooleanField(default=False)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='mobile_otps', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
