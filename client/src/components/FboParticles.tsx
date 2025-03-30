import {createPortal, extend, useFrame} from "@react-three/fiber";
import {useMemo, useRef} from "react";
import * as THREE from "three";
import {useFBO} from "@react-three/drei";

import vertexShader from "../shaders/particleVertex.glsl?raw";
import fragmentShader from "../shaders/particleFragment.glsl?raw";
import createSimulationMaterial, {getRandomData} from "../material/SimulationMaterial.tsx";

const size = 1024;

const positionsTexture = new THREE.DataTexture(
    getRandomData(size, size),
    size,
    size,
    THREE.RGBAFormat,
    THREE.FloatType
);
positionsTexture.needsUpdate = true;

const SimulationMaterial = createSimulationMaterial(positionsTexture);

extend({ SimulationMaterial });

type FboParticlesProps = {
    size: number;
}

function FboParticles({ size = 1024 }: FboParticlesProps) {

    const simulationMaterial = new SimulationMaterial();

    const points = useRef<THREE.Points>(null);

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

    const renderTargetA = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
    });
    const renderTargetB = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
    });
    const readTarget = useRef(renderTargetA);
    const writeTarget = useRef(renderTargetB);

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

        // 1) Set the old positions
        simulationMaterial.uDeltaTime = clock.getDelta();
        simulationMaterial.positions = readTarget.current.texture;
        //simulationMaterialRef.current.uniforms.positions.value = readTarget.current.texture;


        // 2) Render the simulation into the *write* target
        gl.setRenderTarget(writeTarget.current);
        gl.clear();
        gl.render(scene, camera); // The scene that has the <mesh> using <simulationMaterial>
        gl.setRenderTarget(null);

        // 3) Now the new updated positions are in writeTarget.current.texture
        //    Let's assign it to the actual display material (the points)
        if (points.current && points.current.material) {
            const displayMat = points.current.material as THREE.ShaderMaterial;
            if (displayMat.uniforms?.uPositions) {
                displayMat.uniforms.uPositions.value = writeTarget.current.texture;
            }
        }

        // 4) Swap read/write
        const temp = readTarget.current;
        readTarget.current = writeTarget.current;
        writeTarget.current = temp;
    });

    const displayPass = <points ref={points}>
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

    return (
        <>
            {createPortal(
                <mesh>
                    <simulationMaterial args={[size]}/>
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
            {displayPass}
        </>
    );
}

export default FboParticles
