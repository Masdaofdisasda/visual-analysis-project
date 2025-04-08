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

function usePose() {

    return useMemo(() => createPose(), []);
}

export default usePose;
