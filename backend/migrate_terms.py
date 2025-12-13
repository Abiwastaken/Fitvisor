
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

        try:
            print("Executing: ALTER TABLE users ADD COLUMN accepted_terms BOOLEAN DEFAULT 0")
            cursor.execute("ALTER TABLE users ADD COLUMN accepted_terms BOOLEAN DEFAULT 0")
            conn.commit()
            print("Migration completed successfully!")
        except mysql.connector.Error as err:
            if err.errno == 1060:
                print(f"Column already exists: {err}")
            else:
                print(f"Error: {err}")
        
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
