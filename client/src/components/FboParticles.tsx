import {createPortal, useFrame} from "@react-three/fiber";
import {useMemo, useRef} from "react";
import * as THREE from "three";
import {useFBO} from "@react-three/drei";
import {
    createPositionSimulationMaterial,
    createVelocitySimulationMaterial, getPositionData,
    getVelocityData
} from "../material/SimulationMaterial.tsx";
import {createDisplayMaterial} from "../material/DisplayMaterial.tsx";

const SIZE = 1024;

const texPositions = new THREE.DataTexture(
    getPositionData(SIZE, SIZE),
    SIZE,
    SIZE,
    THREE.RGBAFormat,
    THREE.FloatType
);
texPositions.needsUpdate = true;
const texVelocities = new THREE.DataTexture(
    getVelocityData(SIZE, SIZE),
    SIZE,
    SIZE,
    THREE.RGBAFormat,
    THREE.FloatType
);
texVelocities.needsUpdate = true;

const PositionSimulationMaterial = createPositionSimulationMaterial(texPositions, texVelocities);
const VelocitySimulationMaterial = createVelocitySimulationMaterial(texPositions, texVelocities);
const DisplayMaterial = createDisplayMaterial();

type FboParticlesProps = {
    size: number;
    label: string;
}

function FboParticles({ size = SIZE, label }: FboParticlesProps) {
    const velocitySimulationShader = useMemo(
        () => new VelocitySimulationMaterial(size), [size]);
    const positionSimulationShader = useMemo(
        () => new PositionSimulationMaterial(size), [size]);
    const particleShader = useMemo(() =>
    {
        const shaderMaterial = new DisplayMaterial()
        shaderMaterial.blending = THREE.AdditiveBlending;
        shaderMaterial.depthTest = false;

        return shaderMaterial;
    }, []);

    const positionScene = useMemo(() => new THREE.Scene(), []);
    const velocityScene = useMemo(() => new THREE.Scene(), []);
    const simulationCamera = useMemo(
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

    const positionRT_A = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
    });
    const positionsRT_B = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
    });
    const velocityRT_A = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
    });
    const velocityRT_B = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
    });
    const positionRead = useRef(positionRT_A);
    const positionWrite = useRef(positionsRT_B);
    const velocityRead = useRef(velocityRT_A);
    const velocityWrite = useRef(velocityRT_B);

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

    useFrame(({ gl }, delta) => {
        // (1) Set simulation uniforms
        velocitySimulationShader.uDeltaTime = delta;

        const strength = 0.7;
        if (label === 'left') {
            velocitySimulationShader.uForce = new THREE.Vector3(strength);
        } else if (label === 'right') {
            velocitySimulationShader.uForce = new THREE.Vector3(-strength);
        } else {
            velocitySimulationShader.uForce = new THREE.Vector3(0, 0, 0);
        }

        gl.setRenderTarget(velocityWrite.current);
        gl.clear();
        gl.render(velocityScene, simulationCamera);

        positionSimulationShader.uDeltaTime = delta;

        gl.setRenderTarget(positionWrite.current);
        gl.clear();
        gl.render(positionScene, simulationCamera);
        gl.setRenderTarget(null);

        particleShader.texPositions = positionWrite.current.texture;

        velocitySimulationShader.texPositions = positionWrite.current.texture;
        velocitySimulationShader.texVelocities = velocityWrite.current.texture;

        positionSimulationShader.texPositions = positionWrite.current.texture;
        positionSimulationShader.texVelocities = velocityWrite.current.texture;

        let temp = positionRead.current;
        positionRead.current = positionWrite.current;
        positionWrite.current = temp;
        temp = velocityRead.current;
        velocityRead.current = velocityWrite.current;
        velocityWrite.current = temp;

    });

    const posSimulationPass = createPortal(
        <mesh>
            <primitive object={positionSimulationShader} attach="material" />
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-uv"
                    args={[uvs, 2]}
                />
            </bufferGeometry>
        </mesh>,
        positionScene
    )
    const velSimulationPass = createPortal(
        <mesh>
            <primitive object={velocitySimulationShader} attach="material" />
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-uv"
                    args={[uvs, 2]}
                />
            </bufferGeometry>
        </mesh>,
        velocityScene
    )

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
            {velSimulationPass}
            {posSimulationPass}
            {particlePass}
        </group>
    );
}

export default FboParticles
