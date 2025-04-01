import {createPortal, useFrame} from "@react-three/fiber";
import * as THREE from "three";
import {ReactElement, useMemo} from "react";
import {
    createPositionSimulationMaterial,
    createVelocitySimulationMaterial,
    getPositionData, getVelocityData
} from "../material/SimulationMaterial.tsx";
import {Label} from "./DjPoseApp.tsx";
import useQuadGeometry from "../hooks/useQuadGeometry.tsx";
import usePingPongTexture from "../hooks/usePingPongTexture.tsx";

type SimulationPassProps = {
    size: number;
    label: Label;
    setParticleTexture: (texture: THREE.Texture) => void;
}

function SimulationPass(
    { size, label, setParticleTexture }: SimulationPassProps
): ReactElement {
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
        () => new VelocitySimulationMaterial(size), [VelocitySimulationMaterial, size]);
    const positionSimulationShader = useMemo(
        () => new PositionSimulationMaterial(size), [PositionSimulationMaterial, size]);

    const positionScene = useMemo(() => new THREE.Scene(), []);
    const velocityScene = useMemo(() => new THREE.Scene(), []);
    const simulationCamera = useMemo(
        () =>
            new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1),
        []
    );
    const { positions, uvs } = useQuadGeometry();

    const { readTarget: positionRead, writeTarget: positionWrite, swap: swapPositions } = usePingPongTexture(size);
    const { writeTarget: velocityWrite, swap: swapVelocities } = usePingPongTexture(size);

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

        setParticleTexture(positionRead.current.texture);

        velocitySimulationShader.texPositions = positionWrite.current.texture;
        velocitySimulationShader.texVelocities = velocityWrite.current.texture;

        positionSimulationShader.texPositions = positionWrite.current.texture;
        positionSimulationShader.texVelocities = velocityWrite.current.texture;

        swapPositions();
        swapVelocities();

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
