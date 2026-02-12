"""
Management command to identify and optionally remove unused database tables.
This command analyzes the current models and compares with actual database tables
to identify tables that are not needed by the current application.
"""
import os
import django
from django.core.management.base import BaseCommand
from django.apps import apps
from django.conf import settings
from django.db import connection
from django.db.migrations.loader import MigrationLoader


class Command(BaseCommand):
    help = 'Identifies and optionally removes unused database tables'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be removed without actually removing anything',
        )
        parser.add_argument(
            '--remove',
            action='store_true',
            help='Actually remove the unused tables',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        remove = options['remove']

        if remove and dry_run:
            self.stdout.write(
                self.style.ERROR('--dry-run and --remove cannot be used together')
            )
            return

        # Get all models defined in current apps
        app_labels = [app.split('.')[-1] for app in settings.INSTALLED_APPS 
                     if app.startswith('apps.')]
        
        defined_tables = set()
        for app_label in app_labels:
            try:
                app_config = apps.get_app_config(app_label)
                for model in app_config.get_models():
                    defined_tables.add(model._meta.db_table)
            except LookupError:
                self.stdout.write(
                    self.style.WARNING(f'Could not find app config for {app_label}')
                )

        # Tables required by Django core functionality (Wagtail removed from project)
        required_tables = {
            # Django core tables
            'auth_group',
            'auth_group_permissions', 
            'auth_permission',
            'auth_user',
            'auth_user_groups',
            'auth_user_user_permissions',
            'django_content_type',
            'django_migrations',
            'django_session',
            'django_admin_log',
            'django_site',
            
            # (Wagtail tables intentionally omitted — this project no longer requires Wagtail)
            'taggit_tag',
            'taggit_taggeditem',
        }

        # Get all tables in the database
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
            )
            all_tables = {row[0] for row in cursor.fetchall()}

        # Identify tables that are not defined in models and not required
        unused_tables = all_tables - defined_tables - required_tables

        self.stdout.write(
            self.style.SUCCESS(f'Found {len(unused_tables)} potentially unused tables:')
        )
        
        for table in sorted(unused_tables):
            self.stdout.write(f'  - {table}')

        if remove:
            if not dry_run:
                self.stdout.write(
                    self.style.WARNING('Proceeding with table removal...')
                )
                
                # Disable foreign key constraints temporarily
                with connection.cursor() as cursor:
                    # Get all foreign key constraints pointing to these tables
                    for table in unused_tables:
                        # Find foreign key constraints that reference this table
                        cursor.execute("""
                            SELECT 
                                tc.table_name, 
                                kcu.column_name,
                                tc.constraint_name
                            FROM 
                                information_schema.table_constraints AS tc 
                                JOIN information_schema.key_column_usage AS kcu
                                    ON tc.constraint_name = kcu.constraint_name
                                    AND tc.table_schema = kcu.table_schema
                                JOIN information_schema.constraint_column_usage AS ccu
                                    ON ccu.constraint_name = tc.constraint_name
                                    AND ccu.table_schema = tc.table_schema
                            WHERE 
                                tc.constraint_type = 'FOREIGN KEY' 
                                AND ccu.table_name = %s
                        """, [table])
                        
                        for ref_table, ref_col, constraint_name in cursor.fetchall():
                            if ref_table not in unused_tables:
                                self.stdout.write(
                                    self.style.ERROR(
                                        f'Cannot remove {table} - '
                                        f'referenced by {ref_table}.{ref_col}'
                                    )
                                )
                                continue
                            
                            # Drop the constraint if both tables are being removed
                            cursor.execute(
                                f'ALTER TABLE "{ref_table}" DROP CONSTRAINT "{constraint_name}"'
                            )
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f'Dropped constraint {constraint_name} from {ref_table}'
                                )
                            )

                    # Now drop the tables
                    for table in unused_tables:
                        try:
                            cursor.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE')
                            self.stdout.write(
                                self.style.SUCCESS(f'Dropped table {table}')
                            )
                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(f'Could not drop table {table}: {e}')
                            )
            else:
                self.stdout.write(
                    self.style.WARNING('Dry run: No tables were actually removed.')
                )
        elif not dry_run and unused_tables:
            self.stdout.write(
                self.style.WARNING(
                    '\nTo actually remove these tables, run:\n'
                    'python manage.py cleanup_unused_tables --remove\n'
                )
            )
            self.stdout.write(
                self.style.WARNING(
                    'To see what would be removed without doing it, run:\n'
                    'python manage.py cleanup_unused_tables --dry-run\n'
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nCompleted analysis. {len(defined_tables)} tables from models, '
                f'{len(required_tables)} required by framework, '
                f'{len(unused_tables)} potentially unused.'
            )
        )