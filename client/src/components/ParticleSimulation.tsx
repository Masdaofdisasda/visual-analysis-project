import {memo, RefObject} from "react";
import * as THREE from "three";
import SimulationPass from "../passes/SimulationPass.tsx";
import {Label} from "./DjPoseApp.types.ts";
import useParticlePass from "../passes/useParticlePass.tsx";

export type ParticleSimulationProps = {
    size: number;
    label: RefObject<Label>;
}

const ParticleSimulation = memo(
    function ParticleSimulationComponent({ size, label }: ParticleSimulationProps) {
        const {particleShader, particleComponent} = useParticlePass(size);

    function onUpdateParticles(texture: THREE.Texture) {
        particleShader.texPositions = texture;
    }

    return (
        <group>
            <SimulationPass size={size} label={label} setParticleTexture={onUpdateParticles} />
            {particleComponent}
        </group>
    );
});

export default ParticleSimulation
