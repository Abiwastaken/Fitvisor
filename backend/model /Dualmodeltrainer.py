import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.model_selection import train_test_split
from glob import glob
import os
import json

# CONFIGURATION
DATA_DIR = "./Training Data/Pushups/data"
WINDOW_SIZE = 20
STRIDE = 10
BATCH_SIZE = 32
EPOCHS = 100
SAVE_PATH = "./models/pushup_fusion_model.keras"

# 5 Labels (Multi-label capable)
LABELS = ['valid', 'hips_sagging', 'hips_piking', 'head_dropped', 'shallow_reps']
NUM_CLASSES = len(LABELS)
LABEL_MAP = {label: i for i, label in enumerate(LABELS)}

# Shape Configs
SHAPE_KEYPOINTS = 33 * 3  # 99
SHAPE_ANGLES = 8

# DATA LOADING
def load_matched_sequence(sequence_dir):
    """
    Loads matched Keypoints and Angles for a sequence.
    Returns: (keypoints_seq, angles_seq) or (None, None) if mismatch/error.
    """
    # 1. Get all keypoint files (exclude angles)
    all_files = sorted(glob(os.path.join(sequence_dir, "*.npy")))
    kp_files = [f for f in all_files if "angles" not in f]
    
    # 2. Get all angle files
    ang_files = sorted(glob(os.path.join(sequence_dir, "*_angles.npy")))
    
    if len(kp_files) != len(ang_files):
        print(f"  Mismatch in {sequence_dir}: {len(kp_files)} kp vs {len(ang_files)} ang. Skipping end frames.")
        # Truncate to minimum length
        min_len = min(len(kp_files), len(ang_files))
        kp_files = kp_files[:min_len]
        ang_files = ang_files[:min_len]

    if len(kp_files) < WINDOW_SIZE:
        return None, None

    seq_kp = []
    seq_ang = []
    
    for kf, af in zip(kp_files, ang_files):
        # Load Keypoints
        k_data = np.load(kf)
        if k_data.ndim == 2:
             # Take x,y,z only, flatten to 99
            k_data = k_data[:, :3].flatten()
        seq_kp.append(k_data)
        
        # Load Angles
        a_data = np.load(af)
        seq_ang.append(a_data)
        
    return np.array(seq_kp), np.array(seq_ang)

def create_sliding_windows(seq_kp, seq_ang, window_size=20, stride=5):
    windows_kp = []
    windows_ang = []
    
    if len(seq_kp) < window_size:
        return np.array([]), np.array([])
        
    for i in range(0, len(seq_kp) - window_size + 1, stride):
        w_k = seq_kp[i:i+window_size]
        w_a = seq_ang[i:i+window_size]
        windows_kp.append(w_k)
        windows_ang.append(w_a)
        
    return np.array(windows_kp), np.array(windows_ang)

def load_dataset(data_dir):
    X_kp = []
    X_ang = []
    y = []
    
    print(f"Loading matched pairs from {data_dir}...")
    
    for label in LABELS:
        label_dir = os.path.join(data_dir, label)
        if not os.path.exists(label_dir):
            print(f"  Warning: {label} dir not found")
            continue
            
        sequence_dirs = [d for d in glob(os.path.join(label_dir, "*")) if os.path.isdir(d)]
        print(f"  {label}: {len(sequence_dirs)} sequences")
        
        for seq_dir in sequence_dirs:
            try:
                seq_k, seq_a = load_matched_sequence(seq_dir)
                
                if seq_k is not None:
                    # Create Windows
                    wins_k, wins_a = create_sliding_windows(seq_k, seq_a, WINDOW_SIZE, STRIDE)
                    
                    if len(wins_k) > 0:
                        X_kp.extend(wins_k)
                        X_ang.extend(wins_a)
                        
                        # One-hot encoding equivalent for BCE
                        # [0, 0, 1, 0, 0] for class 2
                        label_vec = np.zeros(NUM_CLASSES)
                        label_vec[LABEL_MAP[label]] = 1.0
                        y.extend([label_vec] * len(wins_k))
                        
            except Exception as e:
                print(f"  Error loading {seq_dir}: {e}")
                
    return np.array(X_kp), np.array(X_ang), np.array(y)

# FUSION MODEL (Functional API with CNN-LSTM)
def build_fusion_model():
    # Input 1: Keypoints
    input_kp = layers.Input(shape=(WINDOW_SIZE, SHAPE_KEYPOINTS), name='keypoints_input')
    
    # CNN Block for Keypoints
    x1 = layers.Conv1D(filters=64, kernel_size=3, padding='same', activation='relu')(input_kp)
    x1 = layers.MaxPooling1D(pool_size=2)(x1)
    
    # LSTM Block for Keypoints
    x1 = layers.LSTM(64, return_sequences=True)(x1)
    x1 = layers.Dropout(0.3)(x1)
    x1 = layers.LSTM(32, return_sequences=False)(x1)
    
    # Input 2: Angles
    input_ang = layers.Input(shape=(WINDOW_SIZE, SHAPE_ANGLES), name='angles_input')
    
    # CNN Block for Angles
    x2 = layers.Conv1D(filters=32, kernel_size=3, padding='same', activation='relu')(input_ang)
    x2 = layers.MaxPooling1D(pool_size=2)(x2)
    
    # LSTM Block for Angles
    x2 = layers.LSTM(32, return_sequences=True)(x2)
    x2 = layers.Dropout(0.3)(x2)
    x2 = layers.LSTM(16, return_sequences=False)(x2)
    
    # Fusion
    merged = layers.Concatenate()([x1, x2])
    
    # Shared Dense Layers
    fusion = layers.Dense(32, activation='relu')(merged)
    fusion = layers.Dropout(0.2)(fusion)
    
    # Output: 5 Sigmoids (BCE)
    output = layers.Dense(NUM_CLASSES, activation='sigmoid', name='output')(fusion)
    
    model = keras.Model(inputs=[input_kp, input_ang], outputs=output)
    
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    return model


# TRAINING
def train_model():
    print("\n" + "#"*60)
    print("TRAINING FUSION MODEL")
    print("#"*60)
    
    # 1. Load Data
    X_kp, X_ang, y = load_dataset(DATA_DIR)
    
    if len(X_kp) == 0:
        print("Error: No data found.")
        return
        
    print(f"Keypoints shape: {X_kp.shape}")
    print(f"Angles shape:    {X_ang.shape}")
    print(f"Labels shape:    {y.shape}")
    
    # 2. Split (Needs careful handling for multi-input)
    # Start by gathering indices
    indices = np.arange(len(X_kp))
    train_idx, test_idx = train_test_split(indices, test_size=0.2, random_state=42, stratify=y)
    
    X_train_k = X_kp[train_idx]
    X_train_a = X_ang[train_idx]
    y_train   = y[train_idx]
    
    X_test_k  = X_kp[test_idx]
    X_test_a  = X_ang[test_idx]
    y_test    = y[test_idx]
    
    # 3. Build
    model = build_fusion_model()
    model.summary()
    
    # 4. Train
    callbacks = [
        keras.callbacks.EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True),
        keras.callbacks.ModelCheckpoint(SAVE_PATH, monitor='val_accuracy', save_best_only=True)
    ]
    
    history = model.fit(
        # Pass inputs as list in correct order corresponding to layers.Input
        x=[X_train_k, X_train_a], 
        y=y_train,
        batch_size=BATCH_SIZE,
        epochs=EPOCHS,
        validation_split=0.2,
        callbacks=callbacks
    )
    
    # 5. Evaluate
    loss, acc = model.evaluate([X_test_k, X_test_a], y_test)
    print(f"\nTest Accuracy: {acc:.4f}")
    print(f"Model saved to: {SAVE_PATH}")

if __name__ == "__main__":
    os.makedirs("./models", exist_ok=True)
    train_model()