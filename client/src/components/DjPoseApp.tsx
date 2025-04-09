import {memo, useEffect, useState} from "react";
import usePoseDetection from "../hooks/usePoseDetection.tsx";
import ThreeCanvas from "./ThreeCanvas.tsx";
import {UniformProps} from "./ParticleSimulation.tsx";

const DjPoseApp = memo(function DjPoseAppInternal() {
    const [isDebug, setIsDebug] = useState(false);
    const { detectedLabel, debugOverlay} = usePoseDetection(isDebug);
    const uniforms : UniformProps = {
        uMaxLife: 10,
        uDamping: 0.99,
        uBoundaryRadius: 100,
        uCurlStrength: 1,
    };

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
            <ThreeCanvas uniforms={uniforms} isDebug={isDebug} detectedLabel={detectedLabel} />
            {debugOverlay}
            <div
                className={"absolute bottom-1 right-1 opacity-10 text-white text-sm"}>
                Press 'D' to toggle debug menu
            </div>
           <div
               className={"absolute top-1 right-1 bg-gray-800 p-2 rounded text-white flex flex-col gap-2"}
                style={{opacity: isDebug ? 1 : 0, transition: 'opacity 0.5s'}}
           >
                        <label>
                            uMaxLife:
                            <input
                                type="range"
                                min="1"
                                max="20"
                                step="0.1"
                                defaultValue={10}
                                onChange={(e) => uniforms.uMaxLife = parseFloat(e.target.value)}
                            />
                        </label>
                        <label>
                            uDamping:
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.01"
                                defaultValue={0.99}
                                onChange={(e) => uniforms.uDamping = parseFloat(e.target.value)}
                            />
                        </label>
                        <label>
                            uBoundaryRadius:
                            <input
                                type="range"
                                min="1"
                                max="200"
                                step="1"
                                defaultValue={100}
                                onChange={(e) => uniforms.uBoundaryRadius = parseFloat(e.target.value)}
                            />
                        </label>
                        <label>
                            uCurlStrength:
                            <input
                                type="range"
                                min="0"
                                max="5"
                                step="0.1"
                                defaultValue={1}
                                onChange={(e) => uniforms.uCurlStrength = parseFloat(e.target.value)}
                            />
                        </label>
                    </div>
        </div>
    )
});

export default DjPoseApp;
