import cv2
import mediapipe as mp
import pandas as pd
import os

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=True,      # For processing video frames as images
    model_complexity=1,
    enable_segmentation=False,
    min_detection_confidence=0.5
)

def extract_keypoints_from_video(video_path, label, output_csv):
    cap = cv2.VideoCapture(video_path)

    all_keypoints = []
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break  # Video ended

        # Convert BGR to RGB for MediaPipe
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(frame_rgb)

        if results.pose_landmarks:
            # Landmark: x, y, z, visibility
            # Flatten into a list: [x1, y1, z1, v1, x2, y2, z2, v2, ..., x33, y33, z33, v33]
            landmarks = []
            for lm in results.pose_landmarks.landmark:
                landmarks.extend([lm.x, lm.y, lm.z, lm.visibility])
        else:
            # If no person detected, fill with zeros or skip
            landmarks = [0]*132  # 33 landmarks * 4 values each

        # Append label at the end for classification
        landmarks.append(label)
        all_keypoints.append(landmarks)
        frame_count += 1

    cap.release()

    # Convert to DataFrame
    num_cols = 33*4  # x,y,z,visibility for 33 landmarks
    columns = [f"{coord}{i}" for i in range(33) for coord in ['x','y','z','v']]
    columns.append("label")
    df = pd.DataFrame(all_keypoints, columns=columns)
    # Save to CSV
    if os.path.exists(output_csv):
        df.to_csv(output_csv, mode='a', header=False, index=False)
    else:
        df.to_csv(output_csv, index=False)

    print(f"Extracted {frame_count} frames from {video_path} with label={label}")

# Usage example:
# extract_keypoints_from_video('data/jumping_jacks_01.mp4', 'jumping_jack', 'pose_data.csv')
# extract_keypoints_from_video('data/squats_01.mp4', 'squat', 'pose_data.csv')