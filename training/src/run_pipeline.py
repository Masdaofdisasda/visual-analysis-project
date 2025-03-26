import extract_keypoints as extract
import train_pose_model as train

def main():
    print("Step 1: Extracting keypoints...")
    extract.main()
    print("Step 2: Training model...")
    train.main()

if __name__ == "__main__":
    main()