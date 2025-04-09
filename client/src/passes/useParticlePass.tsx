import {createParticleMaterial} from "../material/ParticleMaterial.tsx";
import {useMemo} from "react";
import * as THREE from "three";

function useParticlePass(
    size: number,
) {
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

    const particleComponent = (<points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[particlesPosition, 3]}
                />
            </bufferGeometry>
            <primitive object={particleShader} attach="material" />
        </points>
    )

    return { particleShader, particleComponent };
}

export default useParticlePass;
