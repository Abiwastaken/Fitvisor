#!/usr/bin/env python3
"""
Script to display all users from the fitvisor_db database
"""
import sys
import os

# Add parent directory to path to allow importing db
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_db_connection
from tabulate import tabulate

def show_all_users():
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to database!")
        print("Please check your .env file and ensure MySQL is running.")
        return
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT 
                id,
                name,
                email,
                age,
                height,
                weight,
                phone,
                is_verified,
                points,
                streak,
                created_at
            FROM users
            ORDER BY created_at DESC
        """)
        
        users = cursor.fetchall()
        
        if not users:
            print("\n📭 No users found in the database.\n")
            return
        
        print(f"\n👥 Total Users: {len(users)}\n")
        
        # Format the data for display
        headers = ["ID", "Name", "Email", "Age", "Height", "Weight", "Phone", "Verified", "Points", "Streak", "Created At"]
        rows = []
        
        for user in users:
            rows.append([
                user['id'],
                user['name'],
                user['email'],
                user['age'] or '-',
                user['height'] or '-',
                user['weight'] or '-',
                user['phone'] or '-',
                '✓' if user.get('is_verified') else '✗',
                user.get('points', 0),
                user.get('streak', 0),
                user['created_at'].strftime('%Y-%m-%d %H:%M') if user['created_at'] else '-'
            ])
        
        print(tabulate(rows, headers=headers, tablefmt='grid'))
        print()
        
    except Exception as e:
        print(f"❌ Error fetching users: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    show_all_users()
