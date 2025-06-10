import {lazy, memo, RefObject, Suspense, useEffect, useState} from "react";
import {UniformProps} from "./ParticleSimulation.tsx";
import usePoseDetection from "../hooks/usePoseDetection.tsx";
import {useMicrophoneLevel} from "../hooks/useMicrophone.tsx";

const ThreeCanvas = lazy(() => import("./ThreeCanvas.tsx"));

const DjPoseApp = memo(function DjPoseAppInternal() {
    const [isDebug, setIsDebug] = useState(false);
    const { detectedLabel, debugOverlay} = usePoseDetection(isDebug);
    const uniforms : UniformProps = {
        uMaxLife: 10,
        uDamping: 0.99,
        uBoundaryRadius: 100,
        uCurlStrength: 1,
        uEnableAudio: 1,
    };
    const audioLevel: RefObject<number> = useMicrophoneLevel()

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
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center h-full">
                    <h1 className="text-2xl font-semibold mb-6">Loading...</h1>
                </div>
            }>
                <ThreeCanvas uniforms={uniforms} audioLevel={audioLevel} isDebug={isDebug} detectedLabel={detectedLabel} />
            </Suspense>
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
                       <label>
                           Enable Audio Input:
                           <input
                               type="checkbox"
                               defaultChecked={true}
                               onChange={(e) => uniforms.uEnableAudio = e.target.checked ? 1 : 0}
                           />
                       </label>
                    </div>
        </div>
    )
});

export default DjPoseApp;
