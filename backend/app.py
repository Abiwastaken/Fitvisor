from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db_connection
import os
import random
import string
from datetime import datetime, timedelta
import certifi
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

# SSL Fix for macOS
os.environ['SSL_CERT_FILE'] = certifi.where()

# Load all env files
load_dotenv()
load_dotenv('sendgrid.env')

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'secret!')
CORS(app) 

# --- Helper Functions ---

def send_email(to_email, subject, content):
    sg_key = os.getenv('SENDGRID_API_KEY')
    if not sg_key:
        print("SendGrid API Key not found!")
        return False
    
    # Use a specific verified sender if available, otherwise fallback (might fail if strict)
    from_email = os.getenv('MAIL_DEFAULT_SENDER', 'no-reply@fitvisor.com') 
    
    message = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=subject,
        html_content=content
    )
    print(f"Attempting to send email from {from_email} to {to_email}...")
    try:
        sg = SendGridAPIClient(sg_key)
        response = sg.send(message)
        print(f"Email sent! Status: {response.status_code}")
        print(f"Response Body: {response.body}")
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

def generate_token(length=64):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

# --- Routes ---

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Backend is running!"})

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    age = data.get('age')
    height = data.get('height')
    weight = data.get('weight')

    if not name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if user exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            return jsonify({"error": "Email already registered"}), 409

        # Generate OTP
        otp = generate_otp()
        hashed_password = generate_password_hash(password)
        
        # Insert user (Not Verified)
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, age, height, weight, verification_code, is_verified) VALUES (%s, %s, %s, %s, %s, %s, %s, 0)",
            (name, email, hashed_password, age, height, weight, otp)
        )
        conn.commit()
        
        # Send Email
        email_content = f"<h3>Welcome to FitVisor!</h3><p>Your verification code is: <strong>{otp}</strong></p>"
        send_email(email, "Verify your email", email_content)
        
        return jsonify({"message": "User registered. Please check your email for verification code."}), 201

    except Exception as e:
        print(f"Error in signup: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    
    if not email or not code:
        return jsonify({"error": "Email and code required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        if user['is_verified']:
            return jsonify({"message": "Already verified"}), 200
            
        if user['verification_code'] == code:
            cursor.execute("UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = %s", (user['id'],))
            conn.commit()
            return jsonify({"message": "Email verified successfully"}), 200
        else:
            return jsonify({"error": "Invalid verification code"}), 400

    finally:
        cursor.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user and check_password_hash(user['password_hash'], password):
            # Check Verification
            if not user['is_verified']:
                return jsonify({"error": "Email not verified. Please verify your account."}), 403

            return jsonify({
                "message": "Login successful",
                "user": {
                    "id": user['id'],
                    "name": user['name'],
                    "email": user['email'],
                    "age": user['age'],
                    "height": user['height'],
                    "weight": user['weight'],
                    "phone": user['phone'],
                    "bio": user['bio'],
                    "avatarUrl": user['avatar_url'],
                    "linkedin": user['linkedin'],
                    "instagram": user['instagram'],
                    "website": user['website']
                }
            }), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        print(f"Error in login: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
             # Don't reveal if user exists or not for security, but for now we'll be explicit for debug
            return jsonify({"error": "User not found"}), 404
        
        token = generate_otp(6) # Using 6 digit OTP for simplicity on mobile, can use long token for links
        expires = datetime.now() + timedelta(minutes=15)
        
        cursor.execute("UPDATE users SET reset_token = %s, reset_token_expires = %s WHERE id = %s", 
                       (token, expires, user['id']))
        conn.commit()
        
        email_content = f"<h3>Reset Password</h3><p>Your password reset code is: <strong>{token}</strong></p><p>Valid for 15 minutes.</p>"
        send_email(email, "Reset your password", email_content)
        
        return jsonify({"message": "Reset code sent to email"}), 200

    finally:
        cursor.close()
        conn.close()

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code') # reset_token
    new_password = data.get('newPassword')
    
    if not email or not code or not new_password:
        return jsonify({"error": "Missing fields"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        if user['reset_token'] != code:
             return jsonify({"error": "Invalid reset code"}), 400
             
        if user['reset_token_expires'] and user['reset_token_expires'] < datetime.now():
             return jsonify({"error": "Reset code expired"}), 400
             
        hashed_password = generate_password_hash(new_password)
        cursor.execute("UPDATE users SET password_hash = %s, reset_token = NULL, reset_token_expires = NULL WHERE id = %s",
                       (hashed_password, user['id']))
        conn.commit()
        
        return jsonify({"message": "Password updated successfully"}), 200
        
    finally:
        cursor.close()
        conn.close()

@app.route('/api/profile', methods=['PUT'])
def update_profile():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        if 'avatarUrl' in data:
            data['avatar_url'] = data['avatarUrl']

        fields_to_update = []
        values = []
        
        allowed_fields = ['name', 'age', 'height', 'weight', 'phone', 'bio', 'avatar_url', 'linkedin', 'instagram', 'website']
        
        for field in allowed_fields:
            if field in data:
                fields_to_update.append(f"{field} = %s")
                values.append(data[field])

        if not fields_to_update:
            return jsonify({"message": "No changes provided"}), 200

        query = f"UPDATE users SET {', '.join(fields_to_update)} WHERE email = %s"
        values.append(email)
        
        cursor.execute(query, tuple(values))
        conn.commit()
        
        return jsonify({"message": "Profile updated successfully"}), 200

    except Exception as e:
        print(f"Error in update_profile: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
