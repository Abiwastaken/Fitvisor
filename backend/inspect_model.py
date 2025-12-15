import tensorflow as tf
import os

try:
    model_path = 'pushup_fusion_model.keras'
    if not os.path.exists(model_path):
        print(f"File not found: {model_path}")
        exit(1)
        
    model = tf.keras.models.load_model(model_path)
    model.summary()
    
    print("\n--- Input Info ---")
    for input in model.inputs:
        print(f"Name: {input.name}, Shape: {input.shape}, Dtype: {input.dtype}")

    print("\n--- Output Info ---")
    for output in model.outputs:
        print(f"Name: {output.name}, Shape: {output.shape}, Dtype: {output.dtype}")
        
except Exception as e:
    print(f"Error loading model: {e}")
