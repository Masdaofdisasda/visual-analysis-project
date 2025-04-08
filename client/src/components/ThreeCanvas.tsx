import {Canvas} from "@react-three/fiber";
import {Perf} from "r3f-perf";
import ParticleSimulation from "./ParticleSimulation.tsx";
import {OrbitControls} from "@react-three/drei";
import {Label, PARTICLE_COUNT} from "./DjPoseApp.types.ts";
import {memo, RefObject} from "react";

export type ThreeCanvasProps = {
    detectedLabel: RefObject<Label>;
    isDebug: boolean;
}

const ThreeCanvas = memo(function ThreeCanvasComponent({
      detectedLabel,
      isDebug
    }: ThreeCanvasProps) {
    return (<Canvas
        camera={{position: [0.0, 0.0, 2.0]}}
    >
        <Perf position="top-left" style={{opacity: isDebug ? 1 : 0, transition: 'opacity 0.5s'}}/>
        <ParticleSimulation size={PARTICLE_COUNT} label={detectedLabel}/>
        <OrbitControls />
    </Canvas>)
});

export default ThreeCanvas;
