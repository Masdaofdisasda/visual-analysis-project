import {RefObject, useEffect, useRef} from "react";
import {Tensor, tensor} from "@tensorflow/tfjs";
import {POSE_CONNECTIONS, Results} from "@mediapipe/pose";
import * as drawingUtils from "@mediapipe/drawing_utils";
import {Camera} from "@mediapipe/camera_utils";
import usePose from "./usePose.tsx";
import useTfjsModel from "./useTfjsModel.tsx";
import {Label} from "../components/DjPoseApp.types.ts";

const LABEL_MAP: Label[] = ["left", "neutral", "right"];

function usePoseEstimation(
    videoRef: RefObject<HTMLVideoElement | null> ,
    canvasRef: RefObject<HTMLCanvasElement | null>,
) : RefObject<Label> {
    const labelRef = useRef<Label>('neutral');
    const { model } = useTfjsModel();
    const pose = usePose();

    useEffect(function PoseEstimation() {
        if (!videoRef.current || !canvasRef.current || !model) return;

        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        const ctx = canvasElement.getContext("2d")!;

        pose.onResults((results: Results) => {
            ctx.save();
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

            if (results.poseLandmarks) {
                drawingUtils.drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
                    color: "#00FF00",
                    lineWidth: 4,
                });
                drawingUtils.drawLandmarks(ctx, results.poseLandmarks, {
                    color: "#FF0000",
                    lineWidth: 2,
                });
            }

            // Perform classification if we have landmarks
            if (results.poseLandmarks) {
                const keypoints = results.poseLandmarks.flatMap((lm) => [
                    lm.x,
                    lm.y,
                    lm.z ?? 0,
                    lm.visibility ?? 1,
                ]);

                const input = tensor([keypoints]);
                const prediction = model.predict(input) as Tensor;

                prediction.array().then((probabilities) => {
                    // probabilities[0] is e.g. [p_left, p_neutral, p_right]
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    const arr = probabilities[0] as number[];
                    const maxVal = Math.max(...arr);
                    const labelIndex = arr.indexOf(maxVal);

                    if (labelRef.current !== LABEL_MAP[labelIndex]) {
                        labelRef.current = LABEL_MAP[labelIndex];
                    }
                });

                input.dispose();
                prediction.dispose?.();
            }

            ctx.restore();
        });

        // Initialize the camera
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await pose.send({ image: videoElement });
            },
            width: 640,
            height: 480,
        });

        camera.start();

        // Cleanup on unmount
        return () => {
            camera.stop();
        };
    }, [canvasRef, model, pose, videoRef]);

    return labelRef;
}

export default usePoseEstimation;
