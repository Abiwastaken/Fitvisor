import cv2
import mediapipe as mp
import numpy as np
import base64

class ExerciseDetector:
    def __init__(self):
        # Tracking variables
        self.current_exercise = None
        self.counter = 0
        self.stage = None
        self.feedback = "Ready"

    def calculate_angle(self, a, b, c):
        """Calculate the angle between three points (a, b, c)."""
        a = np.array(a) # First
        b = np.array(b) # Mid
        c = np.array(c) # End
        
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
            
        return angle

    def process_data(self, data, exercise_type):
        """
        Process normalized landmarks and angles from frontend.
        Expects data structure:
        {
            "landmarks": {
                "left_shoulder": {"x": 0.1, "y": 0.2, "z": 0.3, "visibility": 0.9},
                ...
            },
            "angles": {
                "left_elbow": 160.5,
                "left_knee": ...
            }
        }
        """
        if self.current_exercise != exercise_type:
            self.current_exercise = exercise_type
            self.counter = 0
            self.stage = None
            self.feedback = "Ready"
            
        landmarks = data.get('landmarks', {})
        angles = data.get('angles', {})

        try:
            if self.counter < 5:
                if exercise_type == 'Push-ups':
                    self._detect_pushups(angles)
                elif exercise_type == 'Squats':
                    self._detect_squats(angles)
                elif exercise_type == 'Jumping Jacks':
                    self._detect_jumping_jacks(landmarks, angles)
                
        except Exception as e:
            print(f"Error processing exercise: {e}")
            pass
        
        is_completed = self.counter >= 5
        if is_completed:
            self.feedback = "Great job! Session complete."
            
        return {
            "reps": self.counter,
            "feedback": self.feedback,
            "stage": self.stage,
            "completed": is_completed
        }

    def _detect_pushups(self, angles):
        # Use simple angle logic passed from frontend
        # Assuming frontend calculates 'left_elbow' or 'right_elbow'
        elbow_angle = angles.get('left_elbow', 180) 
        
        # Pushup logic
        if elbow_angle > 160:
            self.stage = "up"
            self.feedback = "Lower body"
        if elbow_angle < 90 and self.stage == 'up':
            self.stage = "down"
            self.counter += 1
            self.feedback = "Good push!"
            
    def _detect_squats(self, angles):
        knee_angle = angles.get('left_knee', 180)
        hip_angle = angles.get('left_hip', 180) # Optional secondary check

        if knee_angle > 160:
            self.stage = "up"
            self.feedback = "Squat down"
        if knee_angle < 90 and self.stage == 'up':
            self.stage = "down"
            self.counter += 1
            self.feedback = "Great depth!"

    def _detect_jumping_jacks(self, landmarks, angles):
        # We might still need raw coordinates for some logic if angles aren't enough
        # But here we act on normalized positions if needed, or mostly angles
        # For Jumping Jacks, distance is key, so we rely on what frontend sends
        # Or simplistic logic if we have coords:
        
        # Let's assume frontend sends specific boolean states or we calculate from normalized coords
        # For now, let's use the hand/feet Y positions if available in normalized 
        # But wait, normalized is relative to hip. 
        # So "left_hand.y < head.y" might translate to "left_hand.y > head.y" (since y is inverted usually? No, standard is y grows down)
        # Actually standard mediapipe: y is 0 at top, 1 at bottom.
        # Normalized relative to hip (0,0): 
        # Hip is 0. Head is negative Y (above). Feet are positive Y (below).
        
        l_ankle = landmarks.get('left_ankle', {'x':0, 'y':0})
        r_ankle = landmarks.get('right_ankle', {'x':0, 'y':0})
        l_wrist = landmarks.get('left_wrist', {'x':0, 'y':0})
        r_wrist = landmarks.get('right_wrist', {'x':0, 'y':0})
        nose = landmarks.get('nose', {'x':0, 'y':0})
        
        feet_dist = abs(l_ankle['x'] - r_ankle['x'])
        
        # Logic: Hands above head (y < nose.y) and feet apart
        if feet_dist > 0.15 and l_wrist['y'] < nose['y'] and r_wrist['y'] < nose['y']:
            self.stage = "out"
            self.feedback = "Jump in"
        if feet_dist < 0.10 and l_wrist['y'] > nose['y'] and r_wrist['y'] > nose['y'] and self.stage == "out":
            self.stage = "in"
            self.counter += 1
            self.feedback = "Jump!"
