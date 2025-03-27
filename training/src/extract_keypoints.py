import cv2
import mediapipe as mp
import os
import pandas as pd
from typing import List

# Constants
LANDMARKS = 33 * 4  # x, y, z, visibility
mp_pose = mp.solutions.pose


def extract_keypoints_from_video(video_path: str, label: str, pose_model=None) -> List[List[float]]:
    cap = cv2.VideoCapture(video_path)
    keypoints = []

    # Allow external reuse of the pose model for better perf
    if pose_model is None:
        pose_model = mp_pose.Pose(static_image_mode=True)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        results = pose_model.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        if results.pose_landmarks:
            row = []
            for lm in results.pose_landmarks.landmark:
                row.extend([lm.x, lm.y, lm.z, lm.visibility])
            row.append(label)
            keypoints.append(row)

    cap.release()
    return keypoints

def process_directory(video_dir: str, label_from_filename=True) -> pd.DataFrame:
    data = []
    pose_model = mp_pose.Pose(static_image_mode=True)

    for file in os.listdir(video_dir):
        if file.endswith(".mp4"):
            label = file.split('_')[0] if label_from_filename else "unknown"
            video_path = os.path.join(video_dir, file)
            print(f"🔍 Processing {file}...")
            data.extend(extract_keypoints_from_video(video_path, label, pose_model=pose_model))

    # Define column names
    columns = [f"{coord}{i}" for i in range(33) for coord in ['x', 'y', 'z', 'v']] + ['label']
    df = pd.DataFrame(data, columns=columns)
    return df

def save_dataframe(df: pd.DataFrame, output_path: str):
    df.to_csv(output_path, index=False)
    print(f"✅ Saved keypoints to {output_path}")

