import {createPortal, useFrame} from "@react-three/fiber";
import * as THREE from "three";
import {useMemo, useRef} from "react";
import {useFBO} from "@react-three/drei";
import {
    createPositionSimulationMaterial,
    createVelocitySimulationMaterial,
    getPositionData, getVelocityData
} from "../material/SimulationMaterial.tsx";
import {Label} from "./DjPoseApp.tsx";

type SimulationPassProps = {
    size: number;
    label: Label;
    setParticleTexture: (texture: THREE.Texture) => void;
}

function SimulationPass(
    { size, label, setParticleTexture }: SimulationPassProps
) {
    const texPositions = new THREE.DataTexture(
        getPositionData(size, size),
        size,
        size,
        THREE.RGBAFormat,
        THREE.FloatType
    );
    texPositions.needsUpdate = true;
    const texVelocities = new THREE.DataTexture(
        getVelocityData(size, size),
        size,
        size,
        THREE.RGBAFormat,
        THREE.FloatType
    );
    texVelocities.needsUpdate = true;

    const PositionSimulationMaterial = createPositionSimulationMaterial(texPositions, texVelocities);
    const VelocitySimulationMaterial = createVelocitySimulationMaterial(texPositions, texVelocities);

    const velocitySimulationShader = useMemo(
        () => new VelocitySimulationMaterial(size), [size]);
    const positionSimulationShader = useMemo(
        () => new PositionSimulationMaterial(size), [size]);
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

    useFrame(({ gl }, delta) => {
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

        //particleShader.texPositions = positionWrite.current.texture;
        setParticleTexture(positionWrite.current.texture);

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

    return (
        <>
            {velSimulationPass}
            {posSimulationPass}
        </>)
}

export default SimulationPass;
