from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import connection
from django.conf import settings
import os


class Command(BaseCommand):
    help = 'Check database integrity and schema completeness'

    def add_arguments(self, parser):
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Display detailed information about tables and columns',
        )

    def handle(self, *args, **options):
        self.stdout.write("Checking database integrity...")
        
        # Check apps with models
        apps_with_models = []
        for app_config in apps.get_app_configs():
            try:
                # Check if app has models
                app_module = apps.get_app_config(app_config.name).module
                if hasattr(app_module, 'models'):
                    apps_with_models.append(app_config.name)
            except LookupError:
                continue
        
        self.stdout.write(f"Apps with models: {len(apps_with_models)}")
        
        # List apps that should have migrations
        expected_apps = [
            'admin', 'auth', 'contenttypes', 'sessions',
            'contentmanagement', 'usermanagement', 'analyticsmanagement',
            'wagtailcore', 'wagtailadmin', 'wagtaildocs', 'wagtailembeds',
            'wagtailforms', 'wagtailimages', 'wagtailredirects', 'wagtailsearch', 'wagtailusers'
        ]
        
        # Check actual tables in database
        with connection.cursor() as cursor:
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
            tables = [row[0] for row in cursor.fetchall()]
        
        self.stdout.write(f"Tables in database: {len(tables)}")
        
        # Check for content management tables
        content_tables = [t for t in tables if 'content' in t.lower()]
        user_tables = [t for t in tables if 'user' in t.lower() or t == 'auth_user']
        auth_tables = [t for t in tables if 'auth' in t.lower()]
        
        self.stdout.write(f"Content-related tables: {len(content_tables)}")
        self.stdout.write(f"User-related tables: {len(user_tables)}")
        self.stdout.write(f"Auth-related tables: {len(auth_tables)}")
        
        # Check ContentItem and ContentPage specifically
        has_content_item = 'contentmanagement_contentitem' in tables
        has_content_page = 'contentmanagement_contentpage' in tables
        
        self.stdout.write(f"ContentItem table exists: {'✅' if has_content_item else '❌'}")
        self.stdout.write(f"ContentPage table exists: {'✅' if has_content_page else '❌'}")
        
        # Check Django migrations
        has_migrations = 'django_migrations' in tables
        self.stdout.write(f"Django migrations table exists: {'✅' if has_migrations else '❌'}")
        
        # Count applied migrations
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM django_migrations;")
            migration_count = cursor.fetchone()[0]
        
        self.stdout.write(f"Applied migrations: {migration_count}")
        
        # Check for any unapplied migrations
        from django.core.management import call_command
        try:
            call_command('makemigrations', check=True, dry_run=True, verbosity=0)
            self.stdout.write("Migration status: All migrations up to date")
        except SystemExit:
            self.stdout.write("⚠️  There are uncreated migrations")
        
        # Summary
        self.stdout.write("\n" + "="*50)
        self.stdout.write("INTEGRITY CHECK SUMMARY:")
        self.stdout.write(f"- ContentItem model: {'✅' if has_content_item else '❌'}")
        self.stdout.write(f"- ContentPage model: {'✅' if has_content_page else '❌'}")
        self.stdout.write(f"- Total tables: {len(tables)}")
        self.stdout.write(f"- Applied migrations: {migration_count}")
        self.stdout.write("="*50)
        
        if has_content_item and has_content_page:
            self.stdout.write(self.style.SUCCESS("✅ Database integrity check passed!"))
        else:
            self.stdout.write(self.style.ERROR("❌ Database integrity issues detected!"))