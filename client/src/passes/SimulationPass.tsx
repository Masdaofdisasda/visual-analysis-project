import {createPortal, useFrame} from "@react-three/fiber";
import * as THREE from "three";
import {memo, ReactElement, RefObject, useMemo} from "react";
import {
    createPositionSimulationMaterial,
    createVelocitySimulationMaterial,
    getPositionData, getVelocityData
} from "../material/SimulationMaterial.tsx";
import useQuadGeometry from "../hooks/useQuadGeometry.tsx";
import usePingPongTexture from "../hooks/usePingPongTexture.tsx";
import {Label} from "../components/DjPoseApp.types.ts";

type SimulationPassProps = {
    size: number;
    label: RefObject<Label>;
    setParticleTexture: (texture: THREE.Texture) => void;
}

const SimulationPass = memo(function SimulationPassInternal(
    { size, label, setParticleTexture}: SimulationPassProps
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

    const { positions, uvs } = useQuadGeometry();
    const { readTarget: positionRead, writeTarget: positionWrite, swap: swapPosition } = usePingPongTexture(size);
    const { readTarget: velocityRead, writeTarget: velocityWrite, swap: swapVelocity } = usePingPongTexture(size);

    function computeVelocitySimulation(delta: number, gl: THREE.WebGLRenderer) {
        velocitySimulationShader.uDeltaTime = delta;
        if (delta > 0) { // for the first frame the initial data texture is already set
            velocitySimulationShader.texPositions = positionRead.current.texture;
            velocitySimulationShader.texVelocities = velocityRead.current.texture;
        }
        const strength = 1.0;
        if (label.current === 'left') {
            velocitySimulationShader.uForce = new THREE.Vector3(0, 0, strength);
        } else if (label.current === 'right') {
            velocitySimulationShader.uForce = new THREE.Vector3(0, 0, -strength);
        } else {
            velocitySimulationShader.uForce = new THREE.Vector3(0, 0, 0);
        }

        gl.setRenderTarget(velocityWrite.current);
        gl.clear();
        gl.render(velocityScene, simulationCamera);
    }

    function computePositionSimulation(
        delta: number, time: number, gl: THREE.WebGLRenderer
    ) {
        positionSimulationShader.uDeltaTime = delta;
        positionSimulationShader.uTime = time;
        if (delta > 0) { // for the first frame the initial data texture is already set
            positionSimulationShader.texPositions = positionRead.current.texture;
            positionSimulationShader.texVelocities = velocityRead.current.texture;
        }

        gl.setRenderTarget(positionWrite.current);
        gl.clear();
        gl.render(positionScene, simulationCamera);
    }

    useFrame(({ gl, clock }, delta) => {
        computeVelocitySimulation(delta, gl);
        computePositionSimulation(delta, clock.elapsedTime, gl);
        gl.setRenderTarget(null);
        setParticleTexture(positionWrite.current.texture);

        swapPosition();
        swapVelocity();
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
});

export default SimulationPass;
