import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

def list_users():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'fitvisor_user'),
            password=os.getenv('DB_PASSWORD', 'Hridaya@123'),
            database=os.getenv('DB_NAME', 'fitvisor_db')
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email, is_verified, verification_code, created_at FROM users")
        users = cursor.fetchall()

        if not users:
            print("No users found.")
            return

        print(f"{'ID':<5} {'Name':<20} {'Email':<30} {'Verified':<10} {'Code':<10} {'Created At'}")
        print("-" * 100)
        for user in users:
            is_ver = str(bool(user['is_verified']))
            code = user['verification_code'] if user['verification_code'] else "N/A"
            print(f"{user['id']:<5} {user['name']:<20} {user['email']:<30} {is_ver:<10} {code:<10} {user['created_at']}")
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    list_users()
