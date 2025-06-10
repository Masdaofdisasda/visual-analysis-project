import {Pose} from "@mediapipe/pose";
import {useMemo} from "react";


function createPose(): Pose {
    const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
    });
    return pose;
}

/**
 * Creates and configures a new instance of the MediaPipe Pose object.
 * The Pose object is used for detecting and tracking human poses in video or image inputs.
 *
 * @returns - A configured instance of the MediaPipe Pose object.
 */
function usePose() {

    return useMemo(function Pose() {
        return createPose();
    }, []);
}

export default usePose;
