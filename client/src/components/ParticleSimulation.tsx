import {useMemo} from "react";
import * as THREE from "three";
import {createDisplayMaterial} from "../material/DisplayMaterial.tsx";
import SimulationPass from "./SimulationPass.tsx";
import {Label} from "./DjPoseApp.tsx";

type ParticleSimulationProps = {
    size: number;
    label: Label;
}

function ParticleSimulation({ size, label }: ParticleSimulationProps) {
const DisplayMaterial = createDisplayMaterial();

    const particleShader = useMemo(() =>
    {
        const shaderMaterial = new DisplayMaterial()
        shaderMaterial.blending = THREE.AdditiveBlending;
        shaderMaterial.depthTest = false;

        return shaderMaterial;
    }, [DisplayMaterial]);

    function setParticleTexture(texture: THREE.Texture) {
        particleShader.texPositions = texture;
    }

    const particlesPosition = useMemo(() => {
        const length = size * size;
        const particles = new Float32Array(length * 3);
        for (let i = 0; i < length; i++) {
            const i3 = i * 3;
            particles[i3 + 0] = (i % size) / size;
            particles[i3 + 1] = i / (size * size);
            particles[i3 + 2] = 0;
        }
        return particles;
    }, [size]);

    const particlePass = useMemo(() => {
        return (<points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[particlesPosition, 3]}
                />
            </bufferGeometry>
            <primitive object={particleShader} attach="material" />
        </points>);
    }, [particlesPosition, particleShader]);

    return (
        <group>
            <SimulationPass size={size} label={label} setParticleTexture={setParticleTexture} />
            {particlePass}
        </group>
    );
}

export default ParticleSimulation
