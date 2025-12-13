import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()
# Also load sendgrid.env if it exists, just in case, though not needed for DB
load_dotenv('sendgrid.env')

def update_schema():
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'fitvisor_user'),
        password=os.getenv('DB_PASSWORD', 'Hridaya@123'),
        database=os.getenv('DB_NAME', 'fitvisor_db')
    )
    cursor = conn.cursor()

    columns_to_add = [
        ("is_verified", "BOOLEAN DEFAULT 0"),
        ("verification_code", "VARCHAR(6)"),
        ("reset_token", "VARCHAR(64)"),
        ("reset_token_expires", "DATETIME")
    ]

    for col_name, col_def in columns_to_add:
        try:
            print(f"Adding column {col_name}...")
            # Try adding the column without IF NOT EXISTS for compatibility
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_def}")
            print(f"Successfully added {col_name}")
        except mysql.connector.Error as err:
            # Error 1060: Duplicate column name
            if err.errno == 1060:
                print(f"Column {col_name} already exists. Skipping.")
            else:
                print(f"Error adding {col_name}: {err}")

    conn.commit()
    cursor.close()
    conn.close()
    print("Schema update completed.")

if __name__ == "__main__":
    update_schema()
