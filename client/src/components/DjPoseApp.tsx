import {useEffect, useState} from "react";
import {Canvas} from "@react-three/fiber";
import {Perf} from "r3f-perf";
import ParticleSimulation from "./ParticleSimulation.tsx";
import {OrbitControls} from "@react-three/drei";
import usePoseDetection from "../hooks/usePoseDetection.tsx";

const PARTICLE_COUNT = 1024; // actual number of particles is 1024 * 1024

export type Label = 'neutral' | 'left' | 'right';

function DjPoseApp() {
    const [isDebug, setIsDebug] = useState(false);
    const { detectedLabel, debugOverlay} = usePoseDetection(isDebug);

    useEffect(() => {
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
            <Canvas
                camera={{ position: [0.0, 0.0, 2.0] }}
            >
                <Perf position="top-left" style={{ opacity: isDebug ? 1 : 0, transition: 'opacity 0.5s' }} />
                <ambientLight intensity={0.5} />
                <ParticleSimulation size={PARTICLE_COUNT} label={detectedLabel} />
                <OrbitControls />
            </Canvas>
            {debugOverlay}
            <div
                className={"absolute bottom-1 right-1 opacity-10 text-white text-sm"}>
                Press 'D' to toggle debug menu
            </div>
        </div>
    )
}

export default DjPoseApp;
