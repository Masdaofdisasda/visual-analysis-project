import {memo, useEffect, useState} from "react";
import usePoseDetection from "../hooks/usePoseDetection.tsx";
import ThreeCanvas from "./ThreeCanvas.tsx";

const DjPoseApp = memo(function DjPoseAppInternal() {
    const [isDebug, setIsDebug] = useState(false);
    const { detectedLabel, debugOverlay} = usePoseDetection(isDebug);

    useEffect(function handleKeyPress() {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'd') {
                setIsDebug(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    return (
        <div className={"h-screen w-screen"}>
            <ThreeCanvas isDebug={isDebug} detectedLabel={detectedLabel} />
            {debugOverlay}
            <div
                className={"absolute bottom-1 right-1 opacity-10 text-white text-sm"}>
                Press 'D' to toggle debug menu
            </div>
        </div>
    )
});

export default DjPoseApp;
