import sys
import os

# Add parent directory to path to allow importing db
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_db_connection
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

load_dotenv()

def create_user():
    try:
        conn = get_db_connection()
        if not conn:
            print("Failed to connect to DB")
            return
            
        cursor = conn.cursor(dictionary=True)

        email = "abi.mukhiya@gmail.com"
        password = "abikal"
        name = "Abi Mukhiya"
        hashed_password = generate_password_hash(password)

        # Check if user already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            print(f"User {email} already exists. Updating password and verification status.")
            cursor.execute(
                "UPDATE users SET password_hash = %s, is_verified = 1 WHERE email = %s",
                (hashed_password, email)
            )
        else:
            print(f"Creating new user {email}...")
            cursor.execute(
                "INSERT INTO users (name, email, password_hash, is_verified) VALUES (%s, %s, %s, 1)",
                (name, email, hashed_password)
            )
            
        conn.commit()
        print("User processed successfully!")
        
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error creating user: {e}")

if __name__ == "__main__":
    create_user()
