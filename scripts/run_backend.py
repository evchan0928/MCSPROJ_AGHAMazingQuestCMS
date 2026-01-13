#!/usr/bin/env python
"""
Script to run the backend Django server
"""

import os
import sys
import subprocess

def run_backend():
    """Run the Django development server."""
    print("🚀 Starting AGHAMazingQuestCMS Backend Server...")
    print("Backend will be available at http://127.0.0.1:8000")
    print("Press Ctrl+C to stop the server\n")
    
    # Set the environment to run the Django server
    os.chdir('/home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS')
    
    # Run the Django development server
    try:
        result = subprocess.run([
            'python', 'manage.py', 'runserver', '127.0.0.1:8000'
        ], env=os.environ)
        
        return result.returncode
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped.")
        return 0

if __name__ == "__main__":
    sys.exit(run_backend())