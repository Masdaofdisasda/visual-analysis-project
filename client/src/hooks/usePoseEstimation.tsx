import {RefObject, useEffect, useRef, useState} from "react";
import {GraphModel, loadGraphModel, Tensor, tensor} from "@tensorflow/tfjs";
import {Pose, POSE_CONNECTIONS, Results} from "@mediapipe/pose";
import * as drawingUtils from "@mediapipe/drawing_utils";
import {Label} from "../components/DjPoseApp.tsx";
import {Camera} from "@mediapipe/camera_utils";


function usePoseEstimation(
    videoRef: RefObject<HTMLVideoElement | null> ,
    canvasRef: RefObject<HTMLCanvasElement | null>,
) : Label {
    const modelRef = useRef<GraphModel | null>(null);
    const [detectedLabel, setDetectedLabel] = useState<Label>("neutral");

    useEffect(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            },
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        const loadModel = async () => {
            modelRef.current = await loadGraphModel('tfjs_model/model.json');
        };
        loadModel();

        pose.onResults((results: Results) => {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d')!;

            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(
                results.image, 0, 0, canvas.width, canvas.height
            );

            if (results.poseLandmarks) {
                drawingUtils.drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS,
                    {color: '#00FF00', lineWidth: 4});
                drawingUtils.drawLandmarks(ctx, results.poseLandmarks,
                    {color: '#FF0000', lineWidth: 2});
            }

            if (results.poseLandmarks && modelRef.current) {
                const keypoints = results.poseLandmarks.flatMap(lm =>
                    [lm.x, lm.y, lm.z ?? 0, lm.visibility ?? 1])

                const input = tensor([keypoints]);
                //TODO derive from labelmap.json
                const labelMap = ['left', 'neutral', 'right'];

                const prediction = modelRef.current.predict(input) as Tensor
                prediction.array().then(probabilities => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    const labelIndex = probabilities[0].indexOf(Math.max(...probabilities[0]));
                    const predictedLabel = labelMap[labelIndex];
                    setDetectedLabel(predictedLabel as Label);
                })
                input.dispose();
            }

            ctx.restore();
        });

        const camera = new Camera(videoRef.current, {
            onFrame: async () => {
                await pose.send({image: videoRef.current!});
            },
            width: 640,
            height: 480,
        });
        camera.start();
    }, [canvasRef, setDetectedLabel, videoRef]);

    return detectedLabel;
}

export default usePoseEstimation;
