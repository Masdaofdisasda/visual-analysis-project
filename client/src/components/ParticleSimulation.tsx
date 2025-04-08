import {memo, RefObject, useRef} from "react";
import * as THREE from "three";
import SimulationPass from "./SimulationPass.tsx";
import ParticlePass from "./ParticlePass.tsx";
import {Label} from "./DjPoseApp.types.ts";

export type ParticleSimulationProps = {
    size: number;
    label: RefObject<Label>;
}

const ParticleSimulation = memo(
    function ParticleSimulationComponent({ size, label }: ParticleSimulationProps) {
    const particleMaterialRef = useRef<THREE.ShaderMaterial & {texPositions: THREE.Texture | null}>(null);

    function onUpdateParticles(texture: THREE.Texture) {
        if (!particleMaterialRef.current) return;
        particleMaterialRef.current.texPositions = texture;
    }

    return (
        <group>
            <SimulationPass size={size} label={label} setParticleTexture={onUpdateParticles} />
            <ParticlePass size={size} ref={particleMaterialRef} />
        </group>
    );
});

export default ParticleSimulation
