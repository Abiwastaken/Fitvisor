#!/usr/bin/env python3
"""
Script to clean up the database:
1. Delete all unverified users
2. Create/update admin user with email verification
"""

import mysql.connector
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv
import os

load_dotenv()

def cleanup_and_setup_admin():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'fitvisor_user'),
            password=os.getenv('DB_PASSWORD', 'Hridaya@123'),
            database=os.getenv('DB_NAME', 'fitvisor_db')
        )
        cursor = conn.cursor(dictionary=True)

        # Step 1: Show current users before cleanup
        print("=" * 60)
        print("CURRENT USERS BEFORE CLEANUP:")
        print("=" * 60)
        cursor.execute("SELECT id, name, email, is_verified FROM users")
        users = cursor.fetchall()
        for user in users:
            verified = "Verified" if user['is_verified'] else "Not Verified"
            print(f"  ID: {user['id']} | {user['name']} | {user['email']} | {verified}")
        
        if not users:
            print("  No users found in database.")

        # Step 2: Delete ALL users
        print("\n" + "=" * 60)
        print("DELETING ALL USERS...")
        print("=" * 60)
        cursor.execute("DELETE FROM users")
        deleted_count = cursor.rowcount
        conn.commit()
        print(f"  Deleted {deleted_count} user(s).")

        # Step 3: Set up admin user (hridayamdr2007@gmail.com)
        admin_email = "hridayamdr2007@gmail.com"
        admin_password = "admin"
        admin_name = "Administrator"
        hashed_password = generate_password_hash(admin_password)

        print("\n" + "=" * 60)
        print("SETTING UP ADMIN USER...")
        print("=" * 60)

        # Create new admin user (table should be empty now)
        cursor.execute(
            """INSERT INTO users (name, email, password_hash, is_verified, verification_code) 
                VALUES (%s, %s, %s, 1, NULL)""",
            (admin_name, admin_email, hashed_password)
        )
        conn.commit()
        print(f"  Created admin user: {admin_email}")
        print(f"  Password: admin")
        print(f"  Status: Verified (no email verification needed)")

        # Step 4: Show remaining users
        print("\n" + "=" * 60)
        print("REMAINING USERS AFTER CLEANUP:")
        print("=" * 60)
        cursor.execute("SELECT id, name, email, is_verified FROM users")
        users = cursor.fetchall()
        for user in users:
            verified = "Verified" if user['is_verified'] else "Not Verified"
            print(f"  ID: {user['id']} | {user['name']} | {user['email']} | {verified}")
        
        if not users:
            print("  No users remaining.")

        print("\n" + "=" * 60)
        print("CLEANUP COMPLETE!")
        print("=" * 60)
        print(f"\nYou can now log in with:")
        print(f"  Email: {admin_email}")
        print(f"  Password: admin")

        cursor.close()
        conn.close()

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    cleanup_and_setup_admin()
