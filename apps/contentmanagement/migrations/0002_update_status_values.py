from django.db import migrations


def forwards_map_status(apps, schema_editor):
    ContentItem = apps.get_model('contentmanagement', 'ContentItem')
    mapping = {
        'uploaded': 'for_editing',
        'edited': 'for_approval',
        'pending_approval': 'for_approval',
        'approved': 'for_publishing',
        'published': 'published',
        'deleted': 'deleted',
    }
    for old, new in mapping.items():
        ContentItem.objects.filter(status=old).update(status=new)


def reverse_map_status(apps, schema_editor):
    ContentItem = apps.get_model('contentmanagement', 'ContentItem')
    mapping = {
        'for_editing': 'uploaded',
        'for_approval': 'edited',
        'for_publishing': 'approved',
        'published': 'published',
        'deleted': 'deleted',
    }
    for new, old in mapping.items():
        ContentItem.objects.filter(status=new).update(status=old)


class Migration(migrations.Migration):

    dependencies = [
        ('contentmanagement', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(forwards_map_status, reverse_map_status),
    ]
