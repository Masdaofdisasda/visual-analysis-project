import {memo, RefObject, useMemo} from "react";
import * as THREE from "three";
import {Label} from "./DjPoseApp.types.ts";
import useParticlePass from "../passes/useParticlePass.tsx";
import useInitialDataTextures from "../hooks/useInitialDataTextures.tsx";
import useVelocitySimulationPass from "../passes/useVelocitySimulationPass.tsx";
import usePositionSimulationPass from "../passes/usePositionSimulationPass.tsx";
import usePingPongTexture from "../hooks/usePingPongTexture.tsx";
import {useFrame} from "@react-three/fiber";

export type ParticleSimulationProps = {
    size: number;
    label: RefObject<Label>;
    uniforms: UniformProps;
}

export type UniformProps = {
    uMaxLife: number,
    uDamping: number,
    uBoundaryRadius: number,
    uCurlStrength: number
}

const ParticleSimulation = memo(
    function ParticleSimulationComponent({ size, label, uniforms }: ParticleSimulationProps) {
        const {particleShader, particleComponent} = useParticlePass(size);
        const {texPositions, texVelocities} = useInitialDataTextures(size);
        const {velocitySimulationShader, velocityScene, velocityComponent} = useVelocitySimulationPass(size, texPositions, texVelocities);
        const {positionSimulationShader, positionScene, positionComponent} = usePositionSimulationPass(size, texPositions, texVelocities);

        const simulationCamera = useMemo(
            () =>
                new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1),
            []
        );

        const { readTarget: positionRead, writeTarget: positionWrite, swap: swapPosition } = usePingPongTexture(size);
        const { readTarget: velocityRead, writeTarget: velocityWrite, swap: swapVelocity } = usePingPongTexture(size);

        function computeVelocitySimulation(delta: number, gl: THREE.WebGLRenderer) {
            velocitySimulationShader.uDeltaTime = delta;
            velocitySimulationShader.uMaxLife = uniforms.uMaxLife;
            velocitySimulationShader.uDamping = uniforms.uDamping;
            velocitySimulationShader.uCurlStrength = uniforms.uCurlStrength;
            velocitySimulationShader.uBoundaryRadius = uniforms.uBoundaryRadius;
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
            positionSimulationShader.uMaxLife = uniforms.uMaxLife;
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
            particleShader.texPositions = positionWrite.current.texture;

            swapPosition();
            swapVelocity();
        });

    return (
        <group>
            <group>
                {velocityComponent}
                {positionComponent}
            </group>
            {particleComponent}
        </group>
    );
});

export default ParticleSimulation
