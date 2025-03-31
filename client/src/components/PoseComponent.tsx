import {useRef, useEffect} from 'react';
import {Label} from "./DjPoseApp.tsx";
import usePoseEstimation from "../hooks/usePoseEstimation.tsx";

const labelColors: Record<string, string> = {
    left: '#ff8400',
    right: '#00aaff',
    neutral: '#8a8a8a',
};

type PoseDetectionProps = {
    setDetectedLabel: (label: Label) => void;
    isDebug: boolean;
};

function PoseDetection({ setDetectedLabel, isDebug }: PoseDetectionProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const detectedLabel = usePoseEstimation(videoRef, canvasRef);

    useEffect(() => {
        setDetectedLabel(detectedLabel);
    }, [detectedLabel, setDetectedLabel]);

    return (
        <div
            className={`flex flex-col items-center justify-center absolute bottom-0 left-0 p-2`}
            style={{
                backgroundColor: labelColors[detectedLabel],
                opacity: isDebug ? 1 : 0,
                transition: 'opacity 0.5s'
            }}
        >
            <h2 className="text-2xl font-semibold mb-6">
                Detected Pose: <span className="capitalize">{detectedLabel}</span>
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
