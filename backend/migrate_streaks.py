import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

def migrate_streaks():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'fitvisor_user'),
            password=os.getenv('DB_PASSWORD', 'Hridaya@123'),
            database=os.getenv('DB_NAME', 'fitvisor_db')
        )
        cursor = conn.cursor()
        
        # Check if column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'last_active_date'")
        result = cursor.fetchone()
        
        if not result:
            print("Adding last_active_date column...")
            cursor.execute("ALTER TABLE users ADD COLUMN last_active_date DATE DEFAULT NULL")
            conn.commit()
            print("Migration successful: last_active_date column added.")
        else:
            print("Column last_active_date already exists.")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    migrate_streaks()
