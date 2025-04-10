import {useMemo, useRef} from "react";
import usePoseEstimation from "./usePoseEstimation.tsx";

const labelColors: Record<string, string> = {
    left: '#ff8400',
    right: '#00aaff',
    neutral: '#8a8a8a',
};

function usePoseDetection(
    isDebug: boolean,
) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const detectedLabel = usePoseEstimation(videoRef, canvasRef);

    const debugCanvas = useMemo(function DebugCanvas() {
        return (
            <>
                <video ref={videoRef} style={{display: 'none'}}/>
                <canvas
                    ref={canvasRef}
                    width={320}
                    height={240}
                    className="border border-black shadow-lg"/>
            </>);
    }, [videoRef, canvasRef]);

    const debugOverlay = useMemo(function DebugOverlay() {
        return (
            <div
                className={`flex flex-col items-center justify-center absolute bottom-0 left-0 p-2`}
                style={{
                    backgroundColor: labelColors[detectedLabel.current],
                    opacity: isDebug ? 1 : 0,
                    transition: 'opacity 0.5s'
                }}
            >
                <h2 className="text-2xl font-semibold mb-6">
                    Detected Pose: <span className="capitalize">{detectedLabel.current}</span>
                </h2>

                {debugCanvas}
            </div>
        )
    }, [debugCanvas, detectedLabel, isDebug]);

    return { detectedLabel, debugOverlay };
}

export default usePoseDetection;
