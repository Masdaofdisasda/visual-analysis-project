import {lazy, memo, RefObject, Suspense, useEffect, useRef, useState} from "react";
import {ParticleSimulationRef, UniformProps} from "./ParticleSimulation.tsx";
import usePoseDetection from "../hooks/usePoseDetection.tsx";
import {useMicrophoneLevel} from "../hooks/useMicrophone.tsx";
import {
    ParticleTextureSize
} from "./DjPoseApp.types.ts";

const ThreeCanvas = lazy(() => import("./ThreeCanvas.tsx"));

/**
 * `DjPoseApp` is a React component that serves as the main application for DJ pose detection and visualization.
 *
 * @returns a full-screen application layout with a Three.js canvas and debug controls.
 */
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
    // states only for UI
    const [maxLife, setMaxLife] = useState(10);
    const [damping, setDamping] = useState(0.99);
    const [boundaryRadius, setBoundaryRadius] = useState(100);
    const [curlStrength, setCurlStrength] = useState(1);
    const [enableAudio, setEnableAudio] = useState(true);
    const [particleTextureSize, setParticleTextureSize] = useState<ParticleTextureSize>(ParticleTextureSize.Medium);
    const audioLevel: RefObject<number> = useMicrophoneLevel();
    const particleSimRef = useRef<ParticleSimulationRef>(null);

    useEffect(function handleKeyPress() {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'd') {
                setIsDebug(prev => !prev);
            } else if (event.key.toLowerCase() === 'r') {
                particleSimRef.current?.reset();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    useEffect(function handleTouchInput() {
        let lastTap = 0;

        const handleTouch = () => {
            const currentTime = new Date().getTime();
            const tapInterval = currentTime - lastTap;

            if (tapInterval < 300 && tapInterval > 0) {
                setIsDebug(prev => !prev);
            }

            lastTap = currentTime;
        };

        window.addEventListener('touchend', handleTouch);
        return () => {
            window.removeEventListener('touchend', handleTouch);
        };
    }, []);

    // Trigger reset with timeout when particle size changes
    useEffect(() => {
        const timeout = setTimeout(() => {
            particleSimRef.current?.reset();
        }, 1000);

        return () => clearTimeout(timeout);
    }, [particleTextureSize]);

    return (
        <div className={"h-screen w-screen"}>
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center h-full">
                    <h1 className="text-2xl font-semibold mb-6">Loading...</h1>
                </div>
            }>
                <ThreeCanvas uniforms={uniforms} audioLevel={audioLevel} isDebug={isDebug} detectedLabel={detectedLabel} particleSimRef={particleSimRef} particleTextureSize={particleTextureSize} />
            </Suspense>
            {debugOverlay}
            <div
                className={"absolute bottom-1 right-1 opacity-10 text-white text-sm"}>
                Press 'D' or double tap to toggle debug menu
            </div>
            <div
                className="absolute top-1 right-1 bg-gray-800 p-3 rounded text-white flex flex-col gap-2 text-sm"
                style={{ opacity: isDebug ? 1 : 0, transition: 'opacity 0.5s' }}
            >
                <label className="flex gap-1 justify-between">
                    <span>Life Span: {maxLife.toFixed(1)} sec</span>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.1"
                        defaultValue={maxLife}
                        onChange={(e) => {
                            uniforms.uMaxLife = parseFloat(e.target.value);
                            setMaxLife(parseFloat(e.target.value));
                        }}
                    />
                </label>

                <label className="flex gap-1 justify-between">
                    <span>Damping: {damping.toFixed(2)}</span>
                    <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.01"
                        defaultValue={damping}
                        onChange={(e) => {
                            uniforms.uDamping = parseFloat(e.target.value);
                            setDamping(parseFloat(e.target.value));
                        }}
                    />
                </label>

                <label className="flex gap-1 justify-between">
                    <span>Boundary Radius: {boundaryRadius}</span>
                    <input
                        type="range"
                        min="1"
                        max="200"
                        step="1"
                        defaultValue={boundaryRadius}
                        onChange={(e) => {
                            uniforms.uBoundaryRadius = parseFloat(e.target.value);
                            setBoundaryRadius(parseFloat(e.target.value));
                        }}
                    />
                </label>

                <label className="flex gap-1 justify-between">
                    <span>Curl Strength: {curlStrength.toFixed(1)}</span>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        defaultValue={curlStrength}
                        onChange={(e) => {
                            uniforms.uCurlStrength = parseFloat(e.target.value);
                            setCurlStrength(parseFloat(e.target.value));
                        }}
                    />
                </label>

                <label className="flex gap-1 justify-between">
                    <span>Particle Quality:</span>
                    <select
                        className="rounded px-1 py-0.5"
                        value={particleTextureSize}
                        onChange={(e) => {
                            setParticleTextureSize(parseInt(e.target.value));
                        }}
                    >
                        <option value={ParticleTextureSize.Small}>Low (512)</option>
                        <option value={ParticleTextureSize.Medium}>Medium (1024)</option>
                        <option value={ParticleTextureSize.Large}>High (2048)</option>
                    </select>
                </label>

                <label className="flex gap-1 justify-between">
                    Enable Audio Input
                    <input
                        type="checkbox"
                        defaultChecked={enableAudio}
                        onChange={(e) => {
                            uniforms.uEnableAudio = e.target.checked ? 1 : 0;
                            setEnableAudio(e.target.checked);
                        }}
                    />
                </label>

                <button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 mt-2"
                    onClick={() => particleSimRef.current?.reset()}
                >
                    Reset Particles
                </button>
            </div>
        </div>
    )
});

export default DjPoseApp;
