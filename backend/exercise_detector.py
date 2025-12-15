from collections import deque
import cv2
import numpy as np
import tensorflow as tf
import os
import time
import math

class ExerciseDetector:
    def __init__(self):
        self.current_exercise = None
        self.counter = 0
        self.stage = None
        self.feedback = "Raise right hand to start"
        
        # State
        self.completed = False
        self.is_active = False 
        
        # Model
        self.model = None
        self.load_model()
        
        # Config
        self.WINDOW_SIZE = 20
        self.CONFIDENCE_THRESHOLD = 0.7
        self.LABELS = ['hips_sagging', 'hips_piking']
        
        # Buffers
        self.kp_buffer = deque(maxlen=self.WINDOW_SIZE)
        self.ang_buffer = deque(maxlen=self.WINDOW_SIZE)
        
        # Report Stats
        self.total_frames = 0
        self.good_frames = 0
        self.mistakes_set = set() # Unique mistakes detected
        self.form_scores = []
        
    def load_model(self):
        try:
            model_path = os.path.join(os.path.dirname(__file__), 'pushup_fusion_model.keras')
            if os.path.exists(model_path):
                self.model = tf.keras.models.load_model(model_path)
                print("✅ Keras model loaded successfully")
            else:
                print(f"❌ Model not found at {model_path}")
        except Exception as e:
            print(f"❌ Error loading model: {e}")

    def start_session(self):
        self.is_active = True
        self.counter = 0
        self.stage = None
        self.feedback = "Go!"
        self.completed = False
        
        # Reset buffers and stats
        self.kp_buffer.clear()
        self.ang_buffer.clear()
        self.total_frames = 0
        self.good_frames = 0
        self.mistakes_set = set()
        self.form_scores = []

    def end_session(self):
        self.is_active = False
        self.completed = True
        self.feedback = "Session Ended"

    def calculate_angle_2d(self, a, b, c):
        """Calculate angle between three points (a, b, c) at b using 2D projection"""
        a = np.array([a['x'], a['y']])
        b = np.array([b['x'], b['y']])
        c = np.array([c['x'], c['y']])
        
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)
        
        if angle > 180.0:
            angle = 360-angle
            
        return angle

    def calculate_angle_3d(self, a, b, c):
        """3D Angle for Squats/Jacks fallback"""
        try:
            a_vec = np.array([a['x'], a['y'], a['z']])
            b_vec = np.array([b['x'], b['y'], b['z']])
            c_vec = np.array([c['x'], c['y'], c['z']])
            ba = a_vec - b_vec
            bc = c_vec - b_vec
            cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
            angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
            return np.degrees(angle)
        except:
            return 180.0

    def get_report(self):
        score = 0
        if self.form_scores:
            score = int(np.mean(self.form_scores) * 100)
        
        if self.total_frames > 5 and len(self.form_scores) == 0:
             score = 100
        elif self.total_frames < 20 and score == 0:
             score = 100 # Default if too short
            
        return {
            "score": score,
            "mistakes": list(self.mistakes_set),
            "summary": "Great workout!" if score > 80 else "Watch your form."
        }

    def process_data(self, data, exercise_type):
        if self.current_exercise != exercise_type:
            self.current_exercise = exercise_type
            self.start_session()
            self.is_active = False # Wait for start
            
        landmarks = data.get('landmarks', {})

        if self.is_active: 
            self.total_frames += 1
            if exercise_type == 'Push-ups':
               self._process_pushups(landmarks)
            elif exercise_type == 'Squats':
               self._process_squats(landmarks)
            elif exercise_type == 'Jumping Jacks':
               self._process_jumping_jacks(landmarks)

        if not self.is_active and not self.completed:
             self.feedback = "Click Start to begin"
        
        return {
            "reps": self.counter,
            "feedback": self.feedback,
            "stage": self.stage,
            "completed": self.completed,
            "isActive": self.is_active,
            "gestureProgress": 0,
            "report": self.get_report() if self.completed else None
        }

    def _process_pushups(self, landmarks):
        # 1. Heuristic Counting (Using 2D angle for consistency with training data ref or just robust 3D?)
        # User snippet used 2D angles for MODEL inputs.
        # But for counting, 3D is usually fine. Let's use 3D for counting robustness.
        l_sh = landmarks.get('11')
        l_el = landmarks.get('13')
        l_wr = landmarks.get('15')
        
        if l_sh and l_el and l_wr:
            elbow_angle = self.calculate_angle_3d(l_sh, l_el, l_wr)
            if elbow_angle > 160:
                self.stage = "up"
            if elbow_angle < 90 and self.stage == 'up':
                self.stage = "down"
                self.counter += 1
        
        # 2. Prepare Features for Model (EXACTLY AS USER SNIPPET)
        # Flatten Keypoints (33 * 3)
        keypoints_flat = []
        for i in range(33):
            key = str(i)
            lm = landmarks.get(key)
            if lm:
                keypoints_flat.extend([lm['x'], lm['y'], lm['z']])
            else:
                keypoints_flat.extend([0.0, 0.0, 0.0])
        
        # Angles (8) - Using 2D as per snippet
        angles = []
        
        def get_pt(idx): return landmarks.get(str(idx))
        
        # Indices from snippet: 
        # 1. Elbows: (11,13,15), (12,14,16)
        # 2. Shoulders: (13,11,23), (14,12,24)
        # 3. Hips: (11,23,25), (12,24,26)
        # 4. Knees: (23,25,27), (24,26,28)
        
        triplets = [
            (11, 13, 15), (12, 14, 16),
            (13, 11, 23), (14, 12, 24),
            (11, 23, 25), (12, 24, 26),
            (23, 25, 27), (24, 26, 28)
        ]
        
        for p1, p2, p3 in triplets:
            pt1, pt2, pt3 = get_pt(p1), get_pt(p2), get_pt(p3)
            if pt1 and pt2 and pt3:
                angles.append(self.calculate_angle_2d(pt1, pt2, pt3))
            else:
                angles.append(180.0)
                
        # Buffer Update
        self.kp_buffer.append(keypoints_flat)
        self.ang_buffer.append(angles)
        
        # Inference
        if len(self.kp_buffer) == self.WINDOW_SIZE and self.model:
            try:
                input_kp = np.array(list(self.kp_buffer)).reshape(1, self.WINDOW_SIZE, 99)
                input_ang = np.array(list(self.ang_buffer)).reshape(1, self.WINDOW_SIZE, 8)
                
                preds = self.model.predict({'keypoints_input': input_kp, 'angles_input': input_ang}, verbose=0)[0]
                
                active_errors = []
                # Multi-label check
                for i, prob in enumerate(preds):
                    if prob > self.CONFIDENCE_THRESHOLD:
                        error_name = self.LABELS[i] # hips_sagging or hips_piking
                        active_errors.append(error_name)
                        self.mistakes_set.add(error_name.replace("_", " ").title())
                
                if not active_errors:
                    self.good_frames += 1
                    self.form_scores.append(1.0)
                    if self.counter > 0 and self.feedback == "Good push!":
                         pass # Keep positive feedback
                    elif self.stage == "down":
                         self.feedback = "Push Up!"
                    else:
                         self.feedback = "Good Form"
                         
                else:
                    self.form_scores.append(0.0)
                    # Feedback based on error
                    if "hips_sagging" in active_errors:
                        self.feedback = "Lift Hips!"
                    elif "hips_piking" in active_errors:
                        self.feedback = "Lower Hips!"
                        
            except Exception as e:
                # print(f"Inference error: {e}")
                pass

    def _process_squats(self, landmarks):
        l_hip = landmarks.get('23')
        l_knee = landmarks.get('25')
        l_ankle = landmarks.get('27')
        if l_hip and l_knee and l_ankle:
            angle = self.calculate_angle_3d(l_hip, l_knee, l_ankle)
            if angle > 160: self.stage = "up"
            if angle < 95 and self.stage == 'up':
                self.stage = "down"
                self.counter += 1
                self.feedback = "Good Squat!" 
                self.form_scores.append(1.0) 

    def _process_jumping_jacks(self, landmarks):
        l_ankle = landmarks.get('27')
        r_ankle = landmarks.get('28')
        l_wrist = landmarks.get('15')
        r_wrist = landmarks.get('16')
        nose = landmarks.get('0')
        if l_ankle and r_ankle and l_wrist and r_wrist and nose:
            feet_dist = abs(l_ankle['x'] - r_ankle['x'])
            hands_up = l_wrist['y'] < nose['y'] and r_wrist['y'] < nose['y']
            hands_down = l_wrist['y'] > nose['y'] and r_wrist['y'] > nose['y']
            if feet_dist > 0.3 and hands_up:
                self.stage = "out"
                self.feedback = "In!"
            if feet_dist < 0.15 and hands_down and self.stage == "out":
                self.stage = "in"
                self.counter += 1
                self.feedback = "Good Jack!"
                self.form_scores.append(1.0)
