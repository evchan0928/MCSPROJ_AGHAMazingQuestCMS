#!/usr/bin/env python
"""
Environment Validation Script for Supabase Migration
"""

import os
import sys
from pathlib import Path

def check_python_version():
    """Check if Python version is correct."""
    print("Checking Python version...")
    
    major, minor = sys.version_info[:2]
    if major == 3 and minor == 11:
        print("✅ Python 3.11 detected")
        return True
    else:
        print(f"❌ Python version {major}.{minor} detected. Expected Python 3.11.")
        return False

def check_virtual_env():
    """Check if virtual environment is active."""
    print("Checking virtual environment...")
    
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("✅ Virtual environment is active")
        return True
    else:
        print("❌ Virtual environment is NOT active. Please run: source venv/bin/activate")
        return False

def check_required_packages():
    """Check if required packages are installed."""
    print("Checking required packages...")
    
    required_packages = [
        'Django',
        'psycopg2-binary',
        'python-dotenv',
        'wagtail',
        'djangorestframework'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            # Convert package name to lowercase and replace hyphens with underscores
            module_name = package.lower().replace('-', '_')
            
            # Special cases
            if package == 'djangorestframework':
                module_name = 'rest_framework'
            elif package == 'python-dotenv':
                module_name = 'dotenv'
            
            __import__(module_name)
            print(f"  ✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"  ❌ {package}")
    
    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print("Install them with: pip install -r requirements.txt")
        return False
    
    print("✅ All required packages are installed")
    return True

def check_env_file():
    """Check if .env file exists and has basic structure."""
    print("Checking .env file...")
    
    env_path = Path(".") / ".env"
    if not env_path.exists():
        print("❌ .env file not found!")
        return False
    
    # Read and validate basic structure
    with open(env_path, 'r') as f:
        content = f.read()
    
    required_vars = ['DB_ENGINE', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST']
    missing_vars = []
    
    for var in required_vars:
        if f'{var}=' not in content:
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {missing_vars}")
        return False
    
    print("✅ .env file exists with required variables")
    return True

def check_django_setup():
    """Check if Django can be properly initialized."""
    print("Checking Django setup...")
    
    try:
        import django
        from django.conf import settings
        
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
        django.setup()
        
        print("✅ Django setup is working")
        return True
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        return False

def main():
    """Main validation function."""
    print("🔍 AGHAMazingQuestCMS - Supabase Environment Validator")
    print("="*60)
    
    checks = [
        ("Python Version", check_python_version),
        ("Virtual Environment", check_virtual_env),
        ("Required Packages", check_required_packages),
        ("Environment File", check_env_file),
        ("Django Setup", check_django_setup),
    ]
    
    results = []
    
    for check_name, check_func in checks:
        print(f"\n{check_name}:")
        result = check_func()
        results.append((check_name, result))
    
    print("\n" + "="*60)
    print("SUMMARY:")
    
    all_passed = True
    for check_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {check_name}: {status}")
        if not result:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All checks passed! Your environment is ready for Supabase migration.")
        print("\nTo proceed with the migration, run:")
        print("  python scripts/migrate_to_supabase.py")
    else:
        print("\n❌ Some checks failed. Please address the issues before proceeding with the migration.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())