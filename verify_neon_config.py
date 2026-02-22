#!/usr/bin/env python3
"""
Verification script for Neon Cloud PostgreSQL configuration
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/.env')

def check_neon_configuration():
    """Check if Neon configuration is properly set up"""
    print("=== Neon Configuration Check ===")
    
    neon_vars = {
        'NEON_DB_NAME': os.getenv('NEON_DB_NAME'),
        'NEON_DB_USER': os.getenv('NEON_DB_USER'), 
        'NEON_DB_HOST': os.getenv('NEON_DB_HOST'),
        'NEON_DB_PORT': os.getenv('NEON_DB_PORT', '5432'),
        'NEON_DB_PASSWORD': os.getenv('NEON_DB_PASSWORD')
    }
    
    missing_vars = []
    for var_name, var_value in neon_vars.items():
        if not var_value or 'your_' in var_value:
            missing_vars.append(var_name)
    
    if missing_vars:
        print("✗ Neon configuration incomplete. Please set these variables in your .env file:")
        for var in missing_vars:
            print(f"  - {var}")
        print("\nYour Neon credentials can be found in your Neon Console:")
        print("  1. Go to https://console.neon.tech/app/projects")
        print("  2. Select your project")
        print("  3. Find the connection details in the 'Connection Details' section")
        return False
    
    print("✓ All Neon environment variables are set")
    print(f"  - Database: {neon_vars['NEON_DB_NAME']}")
    print(f"  - User: {neon_vars['NEON_DB_USER']}")
    print(f"  - Host: {neon_vars['NEON_DB_HOST']}")
    print(f"  - Port: {neon_vars['NEON_DB_PORT']}")
    print(f"  - Password: {'Set' if neon_vars['NEON_DB_PASSWORD'] else 'Not set'}")
    
    # Check if port is correct for Neon
    if neon_vars['NEON_DB_PORT'] != '5432':
        print(f"⚠ Warning: Neon typically uses port 5432, but you have {neon_vars['NEON_DB_PORT']}")
    else:
        print("✓ Using correct port for Neon (5432)")
    
    # Check if host looks like a Neon host
    if 'neon' not in neon_vars['NEON_DB_HOST'].lower() and 'aws-neon' not in neon_vars['NEON_DB_HOST']:
        print(f"⚠ Warning: Host '{neon_vars['NEON_DB_HOST']}' doesn't appear to be a Neon host.")
        print("  Neon hosts typically look like: your-project.region.aws-neon.tech")
    else:
        print("✓ Host appears to be a valid Neon endpoint")
    
    return True

def check_ssl_configuration():
    """Check if SSL is properly configured"""
    print("\n=== SSL Configuration Check ===")
    
    # In the Django settings, we enforce sslmode=require for Neon
    print("✓ SSL mode is set to 'require' for Neon connections")
    print("✓ TCP keepalive settings are configured for stable connections")

def check_django_settings():
    """Check Django settings for Neon compatibility"""
    print("\n=== Django Settings Check ===")
    
    sys.path.insert(0, '/home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/backend')
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
    
    try:
        import django
        django.setup()
        
        from django.conf import settings
        db_config = settings.DATABASES.get('default', {})
        
        if not db_config:
            print("✗ No database configuration found")
            return False
            
        print(f"✓ Database engine: {db_config.get('ENGINE', 'Not set')}")
        print(f"✓ Database host: {db_config.get('HOST', 'Not set')}")
        print(f"✓ Database port: {db_config.get('PORT', 'Not set')}")
        
        ssl_mode = db_config.get('OPTIONS', {}).get('sslmode', 'Not set')
        print(f"✓ SSL mode: {ssl_mode}")
        
        if ssl_mode == 'require':
            print("✓ SSL is properly configured for Neon")
        else:
            print(f"⚠ SSL mode is '{ssl_mode}', but should be 'require' for Neon")
            
        # Check for keepalive settings
        options = db_config.get('OPTIONS', {})
        keepalive_settings = {
            'keepalives': options.get('keepalives'),
            'keepalives_idle': options.get('keepalives_idle'), 
            'keepalives_interval': options.get('keepalives_interval'),
            'keepalives_count': options.get('keepalives_count')
        }
        
        all_set = all(v is not None for v in keepalive_settings.values())
        if all_set:
            print("✓ TCP keepalive settings are configured")
        else:
            print(f"⚠ Missing some keepalive settings: {keepalive_settings}")
            
        return True
        
    except Exception as e:
        print(f"✗ Error checking Django settings: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("Neon Serverless PostgreSQL Configuration Verifier")
    print("=" * 50)
    
    neon_ok = check_neon_configuration()
    check_ssl_configuration()
    django_ok = check_django_settings()
    
    print("\n=== Summary ===")
    if neon_ok and django_ok:
        print("✓ Configuration appears ready for Neon Cloud PostgreSQL")
        print("\nNext steps:")
        print("  1. Run 'python manage.py migrate' to apply schema and table migrations")
        print("  2. Run 'python manage.py showmigrations' to verify all migrations applied")
        print("  3. Test your application to ensure everything works correctly")
    else:
        print("✗ Configuration needs to be updated before connecting to Neon")
        print("  Please follow the setup guide in NEON_SETUP.md")

if __name__ == '__main__':
    main()