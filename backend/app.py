from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db_connection
from exercise_detector import ExerciseDetector
import os
import random
import string
from datetime import datetime, timedelta
import certifi
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import time

# SSL Fix for macOS
os.environ['SSL_CERT_FILE'] = certifi.where()

# Load all env files
load_dotenv()
load_dotenv('sendgrid.env')

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!' # Change this in production
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

CORS(app) # Enable CORS for all routes
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize detector
detector = ExerciseDetector()

# --- Helper Functions ---

def send_email(to_email, subject, content):
    sg_key = os.getenv('SENDGRID_API_KEY')
    if not sg_key:
        print("SendGrid API Key not found!")
        return False
    
    # Use a specific verified sender if available, otherwise fallback
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
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

def generate_token(length=64):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

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
        # Note: We are assuming Age, Height, Weight columns exist as per Hackathon features
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
            if not user.get('is_verified', 1): # Default to 1 if column missing during migration transition, but ideally it should be there
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
                    "phone": user.get('phone'),
                    "bio": user.get('bio'),
                    "avatarUrl": user.get('avatar_url'),
                    "linkedin": user.get('linkedin'),
                    "instagram": user.get('instagram'),
                    "website": user.get('website'),
                    "acceptedTerms": bool(user.get('accepted_terms', 0))
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
             # Security: usually don't reveal, but for dev we will
            return jsonify({"error": "User not found"}), 404
        
        token = generate_otp(6)
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
    code = data.get('code')
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
        # Map frontend camelCase to snake_case
        if 'avatarUrl' in data:
            data['avatar_url'] = data['avatarUrl']

        # Construct update query dynamically
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

@app.route('/api/accept-terms', methods=['POST'])
def accept_terms():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    
    try:
        cursor.execute("UPDATE users SET accepted_terms = 1 WHERE email = %s", (email,))
        conn.commit()
        return jsonify({"message": "Terms accepted successfully"}), 200

    except Exception as e:
        print(f"Error in accept_terms: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()



@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get users sorted by points DESC, limit to top 50 (or more as needed)
        # We also need to calculate rank.
        # For simplicity, we'll fetch all and let frontend handle minor things, 
        # or better, return them sorted and frontend assigns rank based on index.
        query = """
            SELECT id, name, avatar_url, points, streak 
            FROM users 
            ORDER BY points DESC 
            LIMIT 100
        """
        cursor.execute(query)
        users = cursor.fetchall()
        
        # Add a placeholder for 'change' and 'changeAmount' if not in DB
        # In a real app, we'd compare with yesterday's snapshot.
        for user in users:
             # Randomly assign change for visual effect if we don't have history data
             # Or just set to "same" for stability
             user['change'] = "same" 
             user['changeAmount'] = 0
             # Ensure avatar_url is valid, if None use default
             if not user['avatar_url']:
                 user['avatar_url'] = f"https://ui-avatars.com/api/?name={user['name']}&background=random"

        return jsonify(users), 200

    except Exception as e:
        print(f"Error in get_leaderboard: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT id, name, email, age, height, weight, phone, bio, avatar_url, linkedin, instagram, website, created_at FROM users")
        users = cursor.fetchall()
        
        return jsonify(users), 200

    except Exception as e:
        print(f"Error in get_users: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/upload-video', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
    
    file = request.files['video']
    user_id = request.form.get('userId') # Frontend should send this
    exercise_type = request.form.get('exerciseType')
    reps = request.form.get('reps')

    if not user_id or user_id == 'undefined':
        return jsonify({"error": "User ID is required"}), 400

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file:
        filename = secure_filename(f"{int(time.time())}_{file.filename}")
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        
        # Save to DB
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO exercise_sessions (user_id, exercise_type, reps, video_path) VALUES (%s, %s, %s, %s)",
                (user_id, exercise_type, reps, filename)
            )
            conn.commit()
            return jsonify({"message": "Video uploaded successfully", "path": filename}), 201
        except Exception as e:
            print(f"Error saving video to DB: {e}")
            return jsonify({"error": "Database error"}), 500
        finally:
            cursor.close()
            conn.close()

@app.route('/api/exercises', methods=['GET'])
def get_exercises():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Join with users to get user name
        query = """
            SELECT es.*, u.name as user_name, u.avatar_url 
            FROM exercise_sessions es
            JOIN users u ON es.user_id = u.id
            ORDER BY es.created_at DESC
        """
        cursor.execute(query)
        exercises = cursor.fetchall()
        return jsonify(exercises), 200
    except Exception as e:
        print(f"Error fetching exercises: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/exercises/<int:id>', methods=['DELETE'])
def delete_exercise(id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # First get the video path to delete file
        cursor.execute("SELECT video_path FROM exercise_sessions WHERE id = %s", (id,))
        session = cursor.fetchone()
        
        if session:
            video_path = os.path.join(app.config['UPLOAD_FOLDER'], session['video_path'])
            if os.path.exists(video_path):
                os.remove(video_path)
            
            cursor.execute("DELETE FROM exercise_sessions WHERE id = %s", (id,))
            conn.commit()
            return jsonify({"message": "Exercise deleted successfully"}), 200
        else:
            return jsonify({"error": "Exercise not found"}), 404
            
    except Exception as e:
        print(f"Error deleting exercise: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --- SocketIO Events ---

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('process_data')
def handle_data(data):
    # data structure: { 'landmarks': {...}, 'angles': {...}, 'type': 'Squats' }
    exercise_type = data.get('type')
    
    if not exercise_type:
        return
        
    stats = detector.process_data(data, exercise_type)
    
    emit('stats_update', stats)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
