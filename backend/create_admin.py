
import mysql.connector
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv
import os

load_dotenv()

def create_admin():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
        cursor = conn.cursor()

        email = "admin@gmail.com"
        password = "admin"
        name = "Administrator"
        hashed_password = generate_password_hash(password)

        # Check if admin already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            print("Admin user already exists.")
        else:
            cursor.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)",
                (name, email, hashed_password)
            )
            conn.commit()
            print("Admin user created successfully!")
        
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error creating admin: {e}")

if __name__ == "__main__":
    create_admin()
