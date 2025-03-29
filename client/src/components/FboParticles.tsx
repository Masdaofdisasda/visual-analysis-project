import {createPortal, extend, useFrame} from "@react-three/fiber";
import SimulationMaterial from "../material/SimulationMaterial.tsx";
import {useMemo, useRef} from "react";
import * as THREE from "three";
import {useFBO} from "@react-three/drei";

import vertexShader from "../shaders/particleVertex.glsl?raw";
import fragmentShader from "../shaders/particleFragment.glsl?raw";

extend({ SimulationMaterial: SimulationMaterial });

type FboParticlesProps = {
    size: number;
}

function FboParticles({ size = 1024 }: FboParticlesProps) {

    // This reference gives us direct access to our points
    const points = useRef<THREE.Points>(null);
    const simulationMaterialRef = useRef<SimulationMaterial>(null);

    const scene = useMemo(() => new THREE.Scene(), []);
    const camera = useMemo(
        () =>
            new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1),
        []
    );

    // Geometry arrays
    const positions = useMemo(
        () =>
            new Float32Array([
                -1, -1, 0,
                1, -1, 0,
                1,  1, 0,
                -1, -1, 0,
                1,  1, 0,
                -1,  1, 0,
            ]),
        []
    );

    const uvs = useMemo(
        () =>
            new Float32Array([
                0, 0, // bottom-left
                1, 0, // bottom-right
                1, 1, // top-right
                0, 0, // bottom-left
                1, 1, // top-right
                0, 1, // top-left
            ]),
        []
    );

    const renderTarget = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
    });

    // Generate our positions attributes array
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

    const uniforms = useMemo(() => ({
        uPositions: {
            value: null,
        }
    }), [])

    useFrame((state) => {
        const { gl, clock } = state;

        // Render the simulation into the renderTarget
        gl.setRenderTarget(renderTarget);
        gl.clear();
        gl.render(scene, camera);
        gl.setRenderTarget(null);

        // Update the shader material uniform with the render target's texture
        if (points.current && points.current.material) {
            const shaderMat = points.current.material as THREE.ShaderMaterial;
            if (shaderMat.uniforms && shaderMat.uniforms.uPositions) {
                shaderMat.uniforms.uPositions.value = renderTarget.texture;
            }
        }

        // Update the simulation material uniform
        if (simulationMaterialRef.current && simulationMaterialRef.current.uniforms) {
            simulationMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
        }
    });

    return (
        <>
            {createPortal(
                <mesh>
                    <simulationMaterial ref={simulationMaterialRef} args={[size]}/>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={positions.length / 3}
                            array={positions}
                            itemSize={3}
                        />
                        <bufferAttribute
                            attach="attributes-uv"
                            count={uvs.length / 2}
                            array={uvs}
                            itemSize={2}
                        />
                    </bufferGeometry>
                </mesh>,
                scene
            )}
            <points ref={points}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particlesPosition.length / 3}
                        array={particlesPosition}
                        itemSize={3}
                    />
                </bufferGeometry>
                <shaderMaterial
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    fragmentShader={fragmentShader}
                    vertexShader={vertexShader}
                    uniforms={uniforms}
                />
            </points>
        </>
    );
}

export default FboParticles
