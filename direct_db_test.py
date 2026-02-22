#!/usr/bin/env python3
"""
Direct test of PostgreSQL connection to check Neon connectivity
"""
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Load environment variables
load_dotenv('/home/apcadmin/Documents/MCSPROJ_AGHAMazingQuestCMS/.env')

def test_direct_connection():
    # Get database parameters from environment
    db_params = {
        'database': os.getenv('DB_NAME', 'aghamazing_db'),
        'user': os.getenv('DB_USER', 'admin'),
        'password': os.getenv('DB_PASSWORD', 'password123'),
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432'),
        'options': '-c sslmode=require -c keepalives=1 -c keepalives_idle=30 -c keepalives_interval=10 -c keepalives_count=5'
    }
    
    print("Attempting to connect to PostgreSQL with the following parameters:")
    for key, value in db_params.items():
        if key != 'password':
            print(f"  {key}: {value}")
        else:
            print(f"  {key}: {'*' * len(value)}")
    
    try:
        # Attempt connection
        conn = psycopg2.connect(**db_params)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        
        print("\n✓ Successfully connected to the database!")
        
        # Test the connection by running a simple query
        cur = conn.cursor()
        cur.execute("SELECT version();")
        db_version = cur.fetchone()[0]
        print(f"PostgreSQL Version: {db_version}")
        
        # List all tables
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = cur.fetchall()
        print(f"\nFound {len(tables)} tables in the database:")
        for table in tables:
            print(f"  - {table[0]}")
        
        # Check if Django migrations table exists and show latest migrations
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'django_migrations';
        """)
        if cur.rowcount > 0:
            try:
                cur.execute("""
                    SELECT app, name, applied 
                    FROM django_migrations 
                    ORDER BY applied DESC 
                    LIMIT 10;
                """)
                migrations = cur.fetchall()
                print(f"\nLatest 10 Django migrations:")
                for migration in migrations:
                    print(f"  - {migration[0]}.{migration[1]} applied on {migration[2]}")
            except Exception as e:
                print(f"Could not fetch migration info: {e}")
        
        cur.close()
        conn.close()
        
        print("\n✓ Database connectivity test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n✗ Failed to connect to the database: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    test_direct_connection()