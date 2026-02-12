from django.contrib import admin
from .models import CustomUserRole, MobileProfile, MobileScore, MobileBadge, MobileSession, MobileOTP
from django.urls import path
from django.shortcuts import render
from django.urls import reverse


@admin.register(CustomUserRole)
class CustomUserRoleAdmin(admin.ModelAdmin):
	list_display = ('user', 'role_name', 'created_at')
	search_fields = ('user__username', 'role_name')


@admin.register(MobileProfile)
class MobileProfileAdmin(admin.ModelAdmin):
	list_display = ('user', 'display_name', 'phone_number')
	search_fields = ('user__username', 'display_name', 'phone_number')


@admin.register(MobileScore)
class MobileScoreAdmin(admin.ModelAdmin):
	list_display = ('user', 'score', 'created_at')
	search_fields = ('user__username',)


@admin.register(MobileBadge)
class MobileBadgeAdmin(admin.ModelAdmin):
	list_display = ('user', 'badge_name', 'awarded_at')
	search_fields = ('user__username', 'badge_name')


@admin.register(MobileSession)
class MobileSessionAdmin(admin.ModelAdmin):
	list_display = ('user', 'session_key', 'created_at', 'expires_at')
	search_fields = ('user__username', 'session_key')


@admin.register(MobileOTP)
class MobileOTPAdmin(admin.ModelAdmin):
	list_display = ('user', 'email', 'code', 'used', 'created_at', 'expires_at')
	search_fields = ('user__username', 'email', 'code')


# Add a small custom admin page under /admin/mobile/ to surface mobile-related data
def mobile_management_view(request):
	# require admin permissions via admin_view when wiring the URL
	profile_count = MobileProfile.objects.count()
	score_count = MobileScore.objects.count()
	badge_count = MobileBadge.objects.count()
	session_count = MobileSession.objects.count()
	otp_count = MobileOTP.objects.count()

	context = {
		'title': 'Mobile Management',
		'profile_count': profile_count,
		'score_count': score_count,
		'badge_count': badge_count,
		'session_count': session_count,
		'otp_count': otp_count,
		'profile_changelist': reverse('admin:usermanagement_mobileprofile_changelist'),
		'score_changelist': reverse('admin:usermanagement_mobilescore_changelist'),
		'badge_changelist': reverse('admin:usermanagement_mobilebadge_changelist'),
		'session_changelist': reverse('admin:usermanagement_mobilesession_changelist'),
		'otp_changelist': reverse('admin:usermanagement_mobileotp_changelist'),
	}
	return render(request, 'admin/mobile_manage.html', context)


# Hook into the admin site urls to add the custom view. Keep a reference to
# the original get_urls and prepend our custom admin page so we avoid
# signature issues when Django loads admin urls.
_orig_get_urls = admin.site.get_urls

def _get_urls():
	custom_urls = [
		path('mobile/', admin.site.admin_view(mobile_management_view), name='mobile-management'),
	]
	return custom_urls + _orig_get_urls()

# Attach wrapper to the default admin site
admin.site.get_urls = _get_urls
