import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import ParticleSimulation, {ParticleSimulationRef, UniformProps} from "./ParticleSimulation.tsx";
import { Label, PARTICLE_COUNT } from "./DjPoseApp.types.ts";
import {memo, RefObject} from "react";
import { EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { AgXToneMapping } from "three";
import CameraController from "./CameraController.tsx";

export type ThreeCanvasProps = {
    detectedLabel: RefObject<Label>;
    isDebug: boolean;
    uniforms: UniformProps;
    audioLevel: RefObject<number>;
    particleSimRef: RefObject<ParticleSimulationRef | null>;
};

/**
 * React component for rendering a Three.js canvas with particle simulation and post-processing effects.
 *
 * @param props - The props for the component.
 * @returns - The rendered Three.js canvas.
 */
const ThreeCanvas = memo(function ThreeCanvasComponent({
    detectedLabel,
    isDebug,
    uniforms,
    audioLevel, particleSimRef
}: ThreeCanvasProps) {
    return (
        <Canvas camera={{ position: [0.0, 0.0, 2.0], near: 0.1, far: 100 }}
                onCreated={({ gl }) => gl.setClearColor('#000000')}>
            {import.meta.env.DEV && (
                <Perf position="top-left" style={{ opacity: isDebug ? 1 : 0, transition: 'opacity 0.5s' }} />
            )}
            <ParticleSimulation ref={particleSimRef} uniforms={uniforms} audioLevel={audioLevel} size={PARTICLE_COUNT} label={detectedLabel} />
            <CameraController detectedLabel={detectedLabel} />
            <EffectComposer>
                <ToneMapping mode={AgXToneMapping} />
            </EffectComposer>
        </Canvas>
    );
});

export default ThreeCanvas;
