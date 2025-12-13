import cv2
import mediapipe as mp
import numpy as np
import base64
import time

class ExerciseDetector:
    def __init__(self):
        # Tracking variables
        self.current_exercise = None
        self.counter = 0
        self.stage = None
        self.feedback = "Raise right hand to start"
        
        # Gesture Control State
        self.completed = False
        self.is_active = False # Initialize is_active
        self.gesture_start_time = None
        self.last_wrist_pos = None
        self.gesture_feedback = ""
        self.gesture_progress = 0

    def start_session(self):
        """Manually start the session."""
        self.is_active = True
        self.counter = 0
        self.stage = None
        self.feedback = "Go!"
        self.completed = False
        self.gesture_start_time = None
        self.gesture_progress = 0

    def _detect_gesture(self, landmarks):
        """
        Detects if the user shows palm to END the session.
        Only runs if session is active.
        """
        if not self.is_active:
            self.gesture_progress = 0
            return

        r_wrist = landmarks.get('right_wrist')
        r_shoulder = landmarks.get('right_shoulder')
        
        # Check visibility
        if not r_wrist or not r_shoulder or r_wrist['visibility'] < 0.5:
            self.gesture_start_time = None
            self.gesture_feedback = ""
            self.gesture_progress = 0
            return

        # Check if hand is raised
        if r_wrist['y'] > r_shoulder['y'] - 0.1: 
            self.gesture_start_time = None
            self.gesture_feedback = ""
            self.gesture_progress = 0
            return

        # Check Stability
        current_pos = np.array([r_wrist['x'], r_wrist['y']])
        
        if self.gesture_start_time is None:
            self.gesture_start_time = time.time()
            self.last_wrist_pos = current_pos
            self.gesture_feedback = "Hold to Finish..."
            self.gesture_progress = 0
        else:
            dist = np.linalg.norm(current_pos - self.last_wrist_pos)
            self.last_wrist_pos = current_pos
            
            if dist > 0.03: 
                self.gesture_start_time = time.time() 
                self.gesture_feedback = "Hold to Finish..."
                self.gesture_progress = 0
            else:
                elapsed = time.time() - self.gesture_start_time
                self.gesture_progress = min(100, int((elapsed / 5.0) * 100))
                
                if elapsed >= 5.0:
                    # End Session
                    self.is_active = False
                    self.completed = True
                    self.gesture_start_time = None
                    self.gesture_progress = 100
                    self.gesture_feedback = "Finished!"
                    self.feedback = "Session Ended by Gesture"
                else:
                    remaining = 5 - int(elapsed)
                    self.gesture_feedback = f"Finishing in {remaining}s..."

    def process_data(self, data, exercise_type):
        """
        Process normalized landmarks and angles from frontend.
        """
        if self.current_exercise != exercise_type:
            self.current_exercise = exercise_type
            self.counter = 0
            self.stage = None
            self.feedback = "Click Start to begin"
            self.is_active = False
            self.completed = False
            
        landmarks = data.get('landmarks', {})
        angles = data.get('angles', {})

        # Always run gesture detection (now controls Stop)
        self._detect_gesture(landmarks)

        # Only process exercise if active
        if self.is_active:
            try:
                # Removed 5 rep limit
                if exercise_type == 'Push-ups':
                    self._detect_pushups(angles)
                elif exercise_type == 'Squats':
                    self._detect_squats(angles)
                elif exercise_type == 'Jumping Jacks':
                    self._detect_jumping_jacks(landmarks, angles)
                     
            except Exception as e:
                print(f"Error processing exercise: {e}")
                pass
        else:
             if self.gesture_feedback:
                 self.feedback = self.gesture_feedback
             elif not self.completed:
                 self.feedback = "Click Start to begin"
        
        return {
            "reps": self.counter,
            "feedback": self.feedback,
            "stage": self.stage,
            "completed": self.completed,
            "isActive": self.is_active,
            "gestureProgress": self.gesture_progress
        }

    def _detect_pushups(self, angles):
        elbow_angle = angles.get('left_elbow', 180) 
        if elbow_angle > 160:
            self.stage = "up"
            self.feedback = "Lower body"
        if elbow_angle < 90 and self.stage == 'up':
            self.stage = "down"
            self.counter += 1
            self.feedback = "Good push!"
            
    def _detect_squats(self, angles):
        knee_angle = angles.get('left_knee', 180)
        if knee_angle > 160:
            self.stage = "up"
            self.feedback = "Squat down"
        if knee_angle < 90 and self.stage == 'up':
            self.stage = "down"
            self.counter += 1
            self.feedback = "Great depth!"

    def _detect_jumping_jacks(self, landmarks, angles):
        l_ankle = landmarks.get('left_ankle', {'x':0, 'y':0})
        r_ankle = landmarks.get('right_ankle', {'x':0, 'y':0})
        l_wrist = landmarks.get('left_wrist', {'x':0, 'y':0})
        r_wrist = landmarks.get('right_wrist', {'x':0, 'y':0})
        nose = landmarks.get('nose', {'x':0, 'y':0})
        
        feet_dist = abs(l_ankle['x'] - r_ankle['x'])
        
        if feet_dist > 0.15 and l_wrist['y'] < nose['y'] and r_wrist['y'] < nose['y']:
            self.stage = "out"
            self.feedback = "Jump in"
        if feet_dist < 0.10 and l_wrist['y'] > nose['y'] and r_wrist['y'] > nose['y'] and self.stage == "out":
            self.stage = "in"
            self.counter += 1
            self.feedback = "Jump!"
