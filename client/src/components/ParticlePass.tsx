import {ReactElement, RefObject, useMemo} from "react";
import * as THREE from "three";
import {createParticleMaterial} from "../material/ParticleMaterial.tsx";

export type ParticlePassProps = {
    size: number;
    ref: RefObject<THREE.ShaderMaterial | null>;
}

function ParticlePass( { size, ref }: ParticlePassProps) : ReactElement {
    const ParticleMaterial = createParticleMaterial();

    const particleShader = useMemo(() =>
    {
        const shaderMaterial = new ParticleMaterial()
        shaderMaterial.blending = THREE.AdditiveBlending;
        shaderMaterial.depthTest = false;

        return shaderMaterial;
    }, [ParticleMaterial]);

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

    return (<points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[particlesPosition, 3]}
                />
            </bufferGeometry>
            <primitive ref={ref} object={particleShader} attach="material" />
        </points>
    )
}

export default ParticlePass;
