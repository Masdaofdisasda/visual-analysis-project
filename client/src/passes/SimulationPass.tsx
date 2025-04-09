import {useFrame} from "@react-three/fiber";
import * as THREE from "three";
import {memo, ReactElement, RefObject, useMemo, useRef} from "react";
import {
    getPositionData, getVelocityData, PositionSimulationMaterialInstance, VelocitySimulationMaterialInstance
} from "../material/SimulationMaterial.tsx";
import usePingPongTexture from "../hooks/usePingPongTexture.tsx";
import {Label} from "../components/DjPoseApp.types.ts";
import VelocitySimulationPass from "./VelocitySimulationPass.tsx";
import PositionSimulationPass from "./PositionSimulationPass.tsx";

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

    const velocitySimulationMaterialRef = useRef<VelocitySimulationMaterialInstance>(null);
    const positionSimulationMaterialRef = useRef<PositionSimulationMaterialInstance>(null);

    const velocitySceneRef = useRef<THREE.Scene>(null);
    function setVelocitySceneRef(scene: THREE.Scene) {
        velocitySceneRef.current = scene;
    }
    const positionSceneRef = useRef<THREE.Scene>(null);
    function setPositionSceneRef(scene: THREE.Scene) {
        positionSceneRef.current = scene;
    }
    const simulationCamera = useMemo(
        () =>
            new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1),
        []
    );

    const { readTarget: positionRead, writeTarget: positionWrite, swap: swapPosition } = usePingPongTexture(size);
    const { readTarget: velocityRead, writeTarget: velocityWrite, swap: swapVelocity } = usePingPongTexture(size);

    function computeVelocitySimulation(delta: number, gl: THREE.WebGLRenderer) {
        if (velocitySimulationMaterialRef.current == null
            || velocitySceneRef.current == null) return;
        const velocitySimulationShader = velocitySimulationMaterialRef.current;

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
        gl.render(velocitySceneRef.current, simulationCamera);
    }

    function computePositionSimulation(
        delta: number, time: number, gl: THREE.WebGLRenderer
    ) {
        if (positionSimulationMaterialRef.current == null
            || positionSceneRef.current == null) return;
        const positionSimulationShader = positionSimulationMaterialRef.current;

        positionSimulationShader.uDeltaTime = delta;
        positionSimulationShader.uTime = time;
        if (delta > 0) { // for the first frame the initial data texture is already set
            positionSimulationShader.texPositions = positionRead.current.texture;
            positionSimulationShader.texVelocities = velocityRead.current.texture;
        }

        gl.setRenderTarget(positionWrite.current);
        gl.clear();
        gl.render(positionSceneRef.current, simulationCamera);
    }

    useFrame(({ gl, clock }, delta) => {
        computeVelocitySimulation(delta, gl);
        computePositionSimulation(delta, clock.elapsedTime, gl);
        gl.setRenderTarget(null);
        setParticleTexture(positionWrite.current.texture);

        swapPosition();
        swapVelocity();
    });

    return (
        <>
            <VelocitySimulationPass ref={velocitySimulationMaterialRef} setSceneRef={setVelocitySceneRef} size={size} texPositions={texPositions} texVelocities={texVelocities} />
            <PositionSimulationPass ref={positionSimulationMaterialRef} setScene={setPositionSceneRef} size={size} texPositions={texPositions} texVelocities={texVelocities} />
        </>)
});

export default SimulationPass;
