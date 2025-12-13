import cv2
import mediapipe as mp
import numpy as np
import os
from pathlib import Path
from tqdm import tqdm



# CONFIGURATION
# Input: where your recorded videos are
VIDEO_INPUT_DIR = "Training Data/Pushups"  # Change to "./videos/squats" for squats

# Output: where to save extracted .npy files
NPY_OUTPUT_DIR = "Training Data/Pushups/data"     # Change to "./data/squats" for squats

# settings configuration
MIN_DETECTION_CONFIDENCE = 0.7
MIN_TRACKING_CONFIDENCE = 0.7





# MEDIAPIPE POSE EXTRACTOR
class VideoPoseExtractor:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            min_detection_confidence=MIN_DETECTION_CONFIDENCE,
            min_tracking_confidence=MIN_TRACKING_CONFIDENCE
        )
    
    def extract_from_video(self, video_path, output_dir, label):
       
        # Create output directory structure
        video_name = Path(video_path).stem  # e.g., "pushup_good_001"
        save_dir = Path(output_dir) / label / video_name
        save_dir.mkdir(parents=True, exist_ok=True)
        
        # Open video
        cap = cv2.VideoCapture(str(video_path))
        
        if not cap.isOpened():
            print(f"  ✗ Error: Could not open {video_path}")
            return 0
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        print(f"\n  Processing: {Path(video_path).name}")
        print(f"    Total frames: {total_frames}, FPS: {fps:.1f}")
        
        frame_count = 0
        extracted_count = 0
        
        # Progress bar
        pbar = tqdm(total=total_frames, desc="    Extracting", unit="frame")
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Convert BGR to RGB (MediaPipe uses RGB)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe
            results = self.pose.process(rgb_frame)
            
            if results.pose_landmarks:
                # Extract all 33 keypoints (MediaPipe Pose has 33 landmarks)
                keypoints = []
                for landmark in results.pose_landmarks.landmark:
                    keypoints.extend([
                        landmark.x,
                        landmark.y,
                        landmark.z,
                        landmark.visibility
                    ])
                
                # Convert to numpy array and save
                keypoints = np.array(keypoints, dtype=np.float32)
                
                # Save as .npy file
                output_path = save_dir / f"frame_{frame_count:03d}.npy"
                np.save(output_path, keypoints)
                extracted_count += 1
            
            frame_count += 1
            pbar.update(1)
        
        pbar.close()
        cap.release()
        
        print(f"    ✓ Extracted {extracted_count}/{frame_count} frames")
        print(f"    Saved to: {save_dir}")
        
        return extracted_count
    
    def batch_extract(self, input_dir, output_dir):
       
        input_path = Path(input_dir)
        
        total_videos = 0
        total_frames = 0
        
        print("="*70)
        print("BATCH VIDEO TO NPY CONVERSION")
        print("="*70)
        print(f"Input directory: {input_dir}")
        print(f"Output directory: {output_dir}")
        print("="*70)
        
        for label in ['valid', 'invalid']:
            label_dir = input_path / label
            
            if not label_dir.exists():
                print(f"\n⚠ Warning: {label_dir} not found, skipping...")
                continue
            
            # Find all video files
            video_extensions = ['.mp4', '.avi', '.mov', '.MP4', '.AVI', '.MOV']
            video_files = []
            for ext in video_extensions:
                video_files.extend(list(label_dir.glob(f'*{ext}')))
            
            if not video_files:
                print(f"\n⚠ Warning: No videos found in {label_dir}")
                continue
            
            print(f"\n{'='*70}")
            print(f"Processing {label.upper()} videos: {len(video_files)} files")
            print(f"{'='*70}")
            
            for video_path in sorted(video_files):
                frames_extracted = self.extract_from_video(
                    str(video_path), 
                    output_dir, 
                    label
                )
                total_videos += 1
                total_frames += frames_extracted
        
        print(f"\n{'='*70}")
        print("EXTRACTION COMPLETE!")
        print(f"{'='*70}")
        print(f"Total videos processed: {total_videos}")
        print(f"Total frames extracted: {total_frames}")
        print(f"Output directory: {output_dir}")
        print(f"{'='*70}\n")
    
    def cleanup(self):
        """Release MediaPipe resources"""
        self.pose.close()

#VERIFICATION FUNCTION
def verify_extraction(output_dir):
    """
    Verify the extracted data
    """
    output_path = Path(output_dir)
    
  
    print("VERIFICATION")
   
    
    for label in ['valid', 'invalid']:
        label_dir = output_path / label
        
        if not label_dir.exists():
            print(f"\n✗ {label} directory not found")
            continue
        
        sequences = [d for d in label_dir.iterdir() if d.is_dir()]
        total_frames = 0
        
        print(f"\n{label.upper()}:")
        print(f"  Sequences: {len(sequences)}")
        
        for seq in sequences:
            npy_files = list(seq.glob('*.npy'))
            total_frames += len(npy_files)
        
        print(f"  Total frames: {total_frames}")
        
        # Check one sample
        if sequences:
            sample_seq = sequences[0]
            sample_files = list(sample_seq.glob('*.npy'))
            
            if sample_files:
                sample = np.load(sample_files[0])
                print(f"  Sample shape: {sample.shape}")
                print(f"  Sample range: [{sample.min():.3f}, {sample.max():.3f}]")
                
                # Verify it's correct format
                if sample.shape == (132,):
                    print(f"  ✓ Correct format: 33 keypoints × 4 values = 132")
                elif sample.shape == (99,):
                    print(f"  ⚠ Format: 33 keypoints × 3 values = 99 (missing visibility)")
                else:
                    print(f"  ✗ Unexpected format!")



# MAIN FUNCTION
def main():
    """
    Main execution function
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Extract pose keypoints from videos')
    parser.add_argument('--input', type=str, default=VIDEO_INPUT_DIR,
                       help='Input directory containing videos')
    parser.add_argument('--output', type=str, default=NPY_OUTPUT_DIR,
                       help='Output directory for .npy files')
    parser.add_argument('--verify-only', action='store_true',
                       help='Only verify existing extraction')
    
    args = parser.parse_args()
    
    if args.verify_only:
        # Only verification
        verify_extraction(args.output)
        
    else:
        # Full extraction
        extractor = VideoPoseExtractor()
        
        try:
            extractor.batch_extract(args.input, args.output)
        except KeyboardInterrupt:
            print("\n\nInterrupted by user")
        except Exception as e:
            print(f"\n\nError: {e}")
            import traceback
            traceback.print_exc()
        finally:
            extractor.cleanup()
        
        # Verify results
        verify_extraction(args.output)
    
  



if __name__ == "__main__":
    main()
import cv2
import mediapipe as mp
import numpy as np
import os
from pathlib import Path
from tqdm import tqdm



# CONFIGURATION
# Input: where your recorded videos are
VIDEO_INPUT_DIR = "Training Data/Pushups"  # Change to "./videos/squats" for squats

# Output: where to save extracted .npy files
NPY_OUTPUT_DIR = "Training Data/Pushups/data"     # Change to "./data/squats" for squats

# settings configuration
MIN_DETECTION_CONFIDENCE = 0.7
MIN_TRACKING_CONFIDENCE = 0.7





# MEDIAPIPE POSE EXTRACTOR
class VideoPoseExtractor:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            min_detection_confidence=MIN_DETECTION_CONFIDENCE,
            min_tracking_confidence=MIN_TRACKING_CONFIDENCE
        )
    
    def extract_from_video(self, video_path, output_dir, label):
       
        # Create output directory structure
        video_name = Path(video_path).stem  # e.g., "pushup_good_001"
        save_dir = Path(output_dir) / label / video_name
        save_dir.mkdir(parents=True, exist_ok=True)
        
        # Open video
        cap = cv2.VideoCapture(str(video_path))
        
        if not cap.isOpened():
            print(f"  ✗ Error: Could not open {video_path}")
            return 0
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        print(f"\n  Processing: {Path(video_path).name}")
        print(f"    Total frames: {total_frames}, FPS: {fps:.1f}")
        
        frame_count = 0
        extracted_count = 0
        
        # Progress bar
        pbar = tqdm(total=total_frames, desc="    Extracting", unit="frame")
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Convert BGR to RGB (MediaPipe uses RGB)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe
            results = self.pose.process(rgb_frame)
            
            if results.pose_landmarks:
                # Extract all 33 keypoints (MediaPipe Pose has 33 landmarks)
                keypoints = []
                for landmark in results.pose_landmarks.landmark:
                    keypoints.extend([
                        landmark.x,
                        landmark.y,
                        landmark.z,
                        landmark.visibility
                    ])
                
                # Convert to numpy array and save
                keypoints = np.array(keypoints, dtype=np.float32)
                
                # Save as .npy file
                output_path = save_dir / f"frame_{frame_count:03d}.npy"
                np.save(output_path, keypoints)
                extracted_count += 1
            
            frame_count += 1
            pbar.update(1)
        
        pbar.close()
        cap.release()
        
        print(f"    ✓ Extracted {extracted_count}/{frame_count} frames")
        print(f"    Saved to: {save_dir}")
        
        return extracted_count
    
    def batch_extract(self, input_dir, output_dir):
       
        input_path = Path(input_dir)
        
        total_videos = 0
        total_frames = 0
        
        print("="*70)
        print("BATCH VIDEO TO NPY CONVERSION")
        print("="*70)
        print(f"Input directory: {input_dir}")
        print(f"Output directory: {output_dir}")
        print("="*70)
        
        for label in ['valid', 'invalid']:
            label_dir = input_path / label
            
            if not label_dir.exists():
                print(f"\n⚠ Warning: {label_dir} not found, skipping...")
                continue
            
            # Find all video files
            video_extensions = ['.mp4', '.avi', '.mov', '.MP4', '.AVI', '.MOV']
            video_files = []
            for ext in video_extensions:
                video_files.extend(list(label_dir.glob(f'*{ext}')))
            
            if not video_files:
                print(f"\n⚠ Warning: No videos found in {label_dir}")
                continue
            
            print(f"\n{'='*70}")
            print(f"Processing {label.upper()} videos: {len(video_files)} files")
            print(f"{'='*70}")
            
            for video_path in sorted(video_files):
                frames_extracted = self.extract_from_video(
                    str(video_path), 
                    output_dir, 
                    label
                )
                total_videos += 1
                total_frames += frames_extracted
        
        print(f"\n{'='*70}")
        print("EXTRACTION COMPLETE!")
        print(f"{'='*70}")
        print(f"Total videos processed: {total_videos}")
        print(f"Total frames extracted: {total_frames}")
        print(f"Output directory: {output_dir}")
        print(f"{'='*70}\n")
    
    def cleanup(self):
        """Release MediaPipe resources"""
        self.pose.close()

#VERIFICATION FUNCTION
def verify_extraction(output_dir):
    """
    Verify the extracted data
    """
    output_path = Path(output_dir)
    
  
    print("VERIFICATION")
   
    
    for label in ['valid', 'invalid']:
        label_dir = output_path / label
        
        if not label_dir.exists():
            print(f"\n✗ {label} directory not found")
            continue
        
        sequences = [d for d in label_dir.iterdir() if d.is_dir()]
        total_frames = 0
        
        print(f"\n{label.upper()}:")
        print(f"  Sequences: {len(sequences)}")
        
        for seq in sequences:
            npy_files = list(seq.glob('*.npy'))
            total_frames += len(npy_files)
        
        print(f"  Total frames: {total_frames}")
        
        # Check one sample
        if sequences:
            sample_seq = sequences[0]
            sample_files = list(sample_seq.glob('*.npy'))
            
            if sample_files:
                sample = np.load(sample_files[0])
                print(f"  Sample shape: {sample.shape}")
                print(f"  Sample range: [{sample.min():.3f}, {sample.max():.3f}]")
                
                # Verify it's correct format
                if sample.shape == (132,):
                    print(f"  ✓ Correct format: 33 keypoints × 4 values = 132")
                elif sample.shape == (99,):
                    print(f"  ⚠ Format: 33 keypoints × 3 values = 99 (missing visibility)")
                else:
                    print(f"  ✗ Unexpected format!")



# MAIN FUNCTION
def main():
    """
    Main execution function
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Extract pose keypoints from videos')
    parser.add_argument('--input', type=str, default=VIDEO_INPUT_DIR,
                       help='Input directory containing videos')
    parser.add_argument('--output', type=str, default=NPY_OUTPUT_DIR,
                       help='Output directory for .npy files')
    parser.add_argument('--verify-only', action='store_true',
                       help='Only verify existing extraction')
    
    args = parser.parse_args()
    
    if args.verify_only:
        # Only verification
        verify_extraction(args.output)
        
    else:
        # Full extraction
        extractor = VideoPoseExtractor()
        
        try:
            extractor.batch_extract(args.input, args.output)
        except KeyboardInterrupt:
            print("\n\nInterrupted by user")
        except Exception as e:
            print(f"\n\nError: {e}")
            import traceback
            traceback.print_exc()
        finally:
            extractor.cleanup()
        
        # Verify results
        verify_extraction(args.output)
    
  



if __name__ == "__main__":
    main()
