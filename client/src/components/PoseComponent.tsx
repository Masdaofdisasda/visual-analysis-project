import React, {useRef, useEffect} from 'react';
import { Pose, POSE_CONNECTIONS, Results } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import * as drawingUtils from '@mediapipe/drawing_utils';
import {GraphModel, loadGraphModel, Tensor, tensor} from "@tensorflow/tfjs";

const labelColors: Record<string, string> = {
    left: '#ff8400',
    right: '#00aaff',
    neutral: '#8a8a8a',
};

type PoseDetectionProps = {
    label: string;
    setLabel: (label: string) => void;
};

function PoseDetection( {label, setLabel}: PoseDetectionProps) {
    // Refs to HTML elements
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modelRef = useRef<GraphModel | null>(null);

    useEffect(() => {
        if (!videoRef.current || !canvasRef.current) return;

        // 1. Create a Pose instance
        const pose = new Pose({
            locateFile: (file) => {
                // This function tells Pose where to load its .wasm and related files
                // The library includes a default path under node_modules/@mediapipe/pose
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            },
        });

        // Configure pose
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

        // 2. Define the callback for results
        pose.onResults((results: Results) => {
            // Get canvas context
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d')!;

            // Clear the canvas
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the webcam image as a background
            ctx.drawImage(
                results.image, 0, 0, canvas.width, canvas.height
            );

            // 3. Draw the pose skeleton
            if (results.poseLandmarks) {
                drawingUtils.drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS,
                    {color: '#00FF00', lineWidth: 4});
                drawingUtils.drawLandmarks(ctx, results.poseLandmarks,
                    {color: '#FF0000', lineWidth: 2});
            }

            // 4. For classification, you can log or store these landmarks
            if (results.poseLandmarks && modelRef.current) {
                const keypoints = results.poseLandmarks.flatMap(lm =>
                    [lm.x, lm.y, lm.z ?? 0, lm.visibility ?? 1])

                const input = tensor([keypoints]);
                const labelMap = ['left', 'neutral', 'right'];

                const prediction = modelRef.current.predict(input) as Tensor
                prediction.array().then(probabilities => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    const labelIndex = probabilities[0].indexOf(Math.max(...probabilities[0]));
                    const predictedLabel = labelMap[labelIndex];
                    setLabel(predictedLabel)
                })
                input.dispose();
            }

            ctx.restore();
        });

        // 5. Connect the webcam to the Pose instance using Camera
        const camera = new Camera(videoRef.current, {
            onFrame: async () => {
                // Send the frame to Pose for inference
                await pose.send({image: videoRef.current!});
            },
            width: 640,
            height: 480,
        });
        camera.start();
    }, []);

    return (
        <div
            style={{
                backgroundColor: labelColors[label],
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                bottom: 0,
                left: 0,
                padding: '10px'
            }}
        >
            <h2 className="text-2xl font-semibold mb-6">
                Detected Pose: <span className="capitalize">{label}</span>
            </h2>

            <video ref={videoRef} style={{display: 'none'}}/>

            <canvas
                ref={canvasRef}
                width={320}
                height={240}
                className="border border-black shadow-lg"
            />
        </div>
    );
}

export default PoseDetection;
