
import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

def migrate():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
        cursor = conn.cursor()

        # List of new columns to add
        columns = [
            "ADD COLUMN age INT",
            "ADD COLUMN height FLOAT",
            "ADD COLUMN weight FLOAT",
            "ADD COLUMN phone VARCHAR(20)",
            "ADD COLUMN bio TEXT",
            "ADD COLUMN avatar_url VARCHAR(255)",
            "ADD COLUMN linkedin VARCHAR(255)",
            "ADD COLUMN instagram VARCHAR(255)",
            "ADD COLUMN website VARCHAR(255)"
        ]

        for col in columns:
            try:
                print(f"Executing: ALTER TABLE users {col}")
                cursor.execute(f"ALTER TABLE users {col}")
            except mysql.connector.Error as err:
                # If column already exists, skip
                if err.errno == 1060:
                    print(f"Column already exists: {err}")
                else:
                    print(f"Error: {err}")
        
        conn.commit()
        print("Migration completed successfully!")
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
