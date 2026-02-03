try:
    from wagtail.contrib.modeladmin.options import ModelAdmin, modeladmin_register
except Exception:
    # Wagtail >=7 removed the contrib.modeladmin module; provide
    # graceful fallbacks so migrations and startup don't fail.
    def modeladmin_register(*args, **kwargs):
        return None

    class ModelAdmin:
        def __init__(self, *a, **k):
            pass

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()


class DjangoUserAdmin(ModelAdmin):
    model = User
    menu_label = "Users"
    menu_icon = "user"  # wagtail icon
    list_display = ("username", "email", "is_active", "is_staff")
    search_fields = ("username", "email")
    # optionally: inspect edit_handler, list_filter, or form_overrides


class DjangoGroupAdmin(ModelAdmin):
    model = Group
    menu_label = "Roles"
    menu_icon = "group"
    list_display = ("name",)
    search_fields = ("name",)


modeladmin_register(DjangoUserAdmin)
modeladmin_register(DjangoGroupAdmin)
