from django.db import migrations


def create_default_roles(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    role_names = [
        'Admin',
        'Approver',
        'Encoder',
        'Editor',
        'Super Admin',
    ]
    for name in role_names:
        Group.objects.get_or_create(name=name)


def remove_default_roles(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    role_names = [
        'Admin',
        'Approver',
        'Encoder',
        'Editor',
        'Super Admin',
    ]
    Group.objects.filter(name__in=role_names).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('usermanagement', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_roles, remove_default_roles),
    ]
