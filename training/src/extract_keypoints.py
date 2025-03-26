import cv2
import mediapipe as mp
import os
import pandas as pd

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True)
LANDMARKS = 33 * 4  # x, y, z, visibility per landmark

def extract_keypoints_from_video(video_path, label):
    cap = cv2.VideoCapture(video_path)
    keypoints = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        results = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        if results.pose_landmarks:
            row = []
            for lm in results.pose_landmarks.landmark:
                row.extend([lm.x, lm.y, lm.z, lm.visibility])
            row.append(label)
            keypoints.append(row)
    cap.release()
    return keypoints

def main():
    video_dir = '../data/raw'
    out_csv = '../data/pose_data.csv'
    data = []

    for file in os.listdir(video_dir):
        if file.endswith(".mp4"):
            label = file.split('_')[0]  # e.g., "left_01.mp4" → "left"
            video_path = os.path.join(video_dir, file)
            print(f"Processing {file}...")
            data.extend(extract_keypoints_from_video(video_path, label))

    columns = [f"{coord}{i}" for i in range(33) for coord in ['x', 'y', 'z', 'v']] + ['label']
    df = pd.DataFrame(data, columns=columns)
    df.to_csv(out_csv, index=False)
    print(f"Saved keypoints to {out_csv}")

if __name__ == "__main__":
    main()
