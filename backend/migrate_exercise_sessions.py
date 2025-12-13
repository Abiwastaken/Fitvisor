
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

        query = """
        CREATE TABLE IF NOT EXISTS exercise_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            exercise_type VARCHAR(50) NOT NULL,
            reps INT NOT NULL,
            video_path VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """
        
        print("Executing: CREATE TABLE IF NOT EXISTS exercise_sessions...")
        cursor.execute(query)
        
        conn.commit()
        print("Migration completed successfully!")
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
