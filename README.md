==================================================================

               FITVISOR - A Smart Fitness Advisor
               
==================================================================

1. PROJECT OVERVIEW
-------------------
Fitvisor is an interactive fitness web application designed to help users track their workouts, monitor progress, and get real-time feedback on their exercise form. Leveraging computer vision (MediaPipe) and real-time communication (Socket.IO), Fitvisor counts repetitions, corrects posture, and gamifies the fitness experience with leaderboards and streaks.

2. TECHNOLOGY STACK
-------------------
Frontend:
- Framework: React (Vite)
- Language: JavaScript/JSX 
- Styling: Tailwind CSS v4
- Animations: Framer Motion
- State Management & Logic: React Hooks
- Real-time Communication: Socket.io-client
- Computer Vision: MediaPipe Pose (running in browser for low latency)

Backend:
- Framework: Flask (Python)
- Real-time Communication: Flask-SocketIO
- Database: MySQL
- Authentication: JWT/Session based, Email Verification (SendGrid)
- Computer Vision Logic: Custom ExerciseDetector class

Database:
- MySQL (Relational Database)

3. PROJECT STRUCTURE
-------------------
Fitvisor/
├── backend/
│   ├── app.py                  # Main Flask application entry point
│   ├── db.py                   # Database connection logic
│   ├── exercise_detector.py    # Core logic for exercise form correction & counting
│   ├── schema.sql              # Database schema definitions
│   ├── check_users.py          # Utility to inspect registered users
│   ├── create_admin.py         # Utility to create admin accounts
│   ├── migrations/             # Database migration scripts
│   └── uploads/                # Directory for storing user-uploaded exercise videos
│
└── frontend/
    ├── src/
    │   ├── App.jsx             # Main React Component & Routing
    │   ├── main.jsx            # Entry point
    │   ├── components/         # Reusable UI Components
    │   │   ├── Navbar.jsx
    │   │   ├── Hero.jsx
    │   │   ├── LoginSignup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── ExerciseTracker.jsx
    │   │   └── ...
    │   └── assets/             # Images and static assets
    ├── public/                 # Public static files
    ├── package.json            # Frontend dependencies
    └── vite.config.js          # Vite configuration

4. INSTALLATION & SETUP
-----------------------

Prerequisites:
- Node.js & npm
- Python 3.8+
- MySQL Server

A. Database Setup:
1. Create a MySQL database named 'fitvisor_db'.
2. Run the `backend/schema.sql` script to create the necessary tables.

B. Backend Setup:
1. Navigate to the backend folder: `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate environment: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Configure `.env` file with DB credentials and SendGrid API Key.
6. Run the server: `python app.py`

C. Frontend Setup:
1. Navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

5. KEY FEATURES
---------------
1. User Authentication:
   - Secure Signup/Login with password hashing.
   - Email Verification using OTP (SendGrid).
   - Password Reset functionality.

2. Dashboard & Profile:
   - User profile management (Bio, Age, Height, Weight).
   - Streak tracking and points system.
   - Personalized avatar support.

3. AI Exercise Tracking:
   - Real-time pose detection using MediaPipe.
   - Supports: Squats, Jumping Jacks.
   - [NOTE: Advanced Push-up ML Model is located on an external device (Team Member's Laptop) for the Hackathon demo].
   - Visual feedback for form correction (e.g., "Lower body", "Jump in").

4. Gamification:
   - Leaderboard showing top users based on points.
   - Interface for uploading completion videos.

5. Gesture Control:
   - "Hold to Finish": Users can raise their hand and hold to end the exercise session without touching the screen.

6. API DOCUMENTATION (Endpoints)
--------------------------------
[POST] /api/signup           - Register a new user
[POST] /api/login            - Authenticate user
[POST] /api/verify-email     - Verify user email with OTP
[POST] /api/forgot-password  - Request password reset OTP
[POST] /api/reset-password   - Reset password with OTP
[PUT]  /api/profile          - Update user profile details
[GET]  /api/leaderboard      - Fetch top users
[GET]  /api/users            - Fetch all users (Admin)
[POST] /api/upload-video     - Upload exercise session video
[GET]  /api/exercises        - Get history of exercise sessions
[DELETE] /api/exercises/<id> - Delete an exercise session

7. SOCKET.IO EVENTS
-------------------
Events Emitted by Client:
- 'start_exercise': Triggers the detector handling session.
- 'process_data': Sends landmarks and angles from frontend to backend for analysis.

Events Received by Client:
- 'stats_update': Returns current reps, feedback message, and gesture progress.

8. MACHINE LEARNING MODULE
--------------------------
The core logic resides in `exercise_detector.py`. It processes normalized landmark data:
- Calculates angles (elbows, knees, etc.).
- Determines exercise states (e.g., "up", "down").
- Counts repetitions based on state transitions.
- [DISCLAIMER]: The specialized High-Performance Push-up Model is hosted separately on a teammate's machine for this Hackathon presentation and is integrated via local network/external reference where applicable.

9. DATABASE SCHEMA
------------------
- users: Stores user info, auth data, points, streaks, verification status.
- exercise_sessions: Logs completed exercises, rep counts, and video paths.

================================================================================
