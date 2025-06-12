import {forwardRef, memo, RefObject, useImperativeHandle, useMemo, useRef} from "react";
import * as THREE from "three";
import {Label, ParticleCount, ParticleTextureSize, textureSizeToParticleCount} from "./DjPoseApp.types.ts";
import useParticlePass from "../passes/useParticlePass.tsx";
import useInitialDataTextures from "../hooks/useInitialDataTextures.tsx";
import useVelocitySimulationPass from "../passes/useVelocitySimulationPass.tsx";
import usePositionSimulationPass from "../passes/usePositionSimulationPass.tsx";
import usePingPongTexture from "../hooks/usePingPongTexture.tsx";
import {useFrame, useThree} from "@react-three/fiber";

export type ParticleSimulationProps = {
    label: RefObject<Label>;
    uniforms: UniformProps;
    audioLevel: RefObject<number>;
    particleTextureSize: ParticleTextureSize;
}

/**
 * Uniform properties for the particle simulation.
 *
 * @property uMaxLife - Maximum lifespan of particles.
 * @property uDamping - Damping factor for particle velocity.
 * @property uBoundaryRadius - Radius of the simulation boundary.
 * @property uCurlStrength - Strength of the curl noise applied to particles.
 * @property uEnableAudio - Flag to enable or disable audio-based effects {0: disable, 1: enable}.
 */
export type UniformProps = {
    uMaxLife: number,
    uDamping: number,
    uBoundaryRadius: number,
    uCurlStrength: number,
    uEnableAudio: number,
}

export interface ParticleSimulationRef {
    reset: () => void;
}

/**
 * React component for simulating particles in a 3D space.
 * This component integrates multiple simulation passes for velocity and position updates,
 * and applies forces based on detected pose labels and audio levels.
 *
 * @param props - The props for the component.
 * @returns - The rendered particle simulation group.
 */
const ParticleSimulation = memo(
    forwardRef(function ParticleSimulationComponent(
        { label, uniforms, audioLevel, particleTextureSize }: ParticleSimulationProps,
        ref
    ) {
        const { gl } = useThree();
        const deltaHistory = useRef<number[]>([]);
        const {particleShader, particleComponent} = useParticlePass(particleTextureSize);
        const {texPositions, texVelocities} = useInitialDataTextures(particleTextureSize);
        const {velocitySimulationShader, velocityScene, velocityComponent} = useVelocitySimulationPass(texPositions, texVelocities);
        const {positionSimulationShader, positionScene, positionComponent} = usePositionSimulationPass(texPositions, texVelocities);

        const simulationCamera = useMemo(
            () =>
                new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1),
            []
        );

        const { readTarget: positionRead, writeTarget: positionWrite, swap: swapPosition } = usePingPongTexture(particleTextureSize);
        const { readTarget: velocityRead, writeTarget: velocityWrite, swap: swapVelocity } = usePingPongTexture(particleTextureSize);

        function resetTextures(gl: THREE.WebGLRenderer) {
            gl.setRenderTarget(positionRead.current);
            gl.clear();
            gl.copyTextureToTexture(
                texPositions,
                positionRead.current.texture
            );

            gl.setRenderTarget(velocityRead.current);
            gl.clear();
            gl.copyTextureToTexture(
                texVelocities,
                velocityRead.current.texture
            );

            gl.setRenderTarget(null);
            console.log("Simulation reset to initial state.");
        }

        useImperativeHandle(ref, () => ({
            reset: () => {
                resetTextures(gl);
            }
        }));

        function computeVelocitySimulation(delta: number, gl: THREE.WebGLRenderer) {
            velocitySimulationShader.uDeltaTime = delta;
            velocitySimulationShader.uMaxLife = uniforms.uMaxLife;
            velocitySimulationShader.uDamping = uniforms.uDamping;
            const audioLevelValue = Math.max(audioLevel.current * uniforms.uEnableAudio, 0.00001)
            velocitySimulationShader.uCurlStrength = uniforms.uCurlStrength * audioLevelValue;
            velocitySimulationShader.uBoundaryRadius = uniforms.uBoundaryRadius;
            if (delta > 0) { // for the first frame the initial data texture is already set
                velocitySimulationShader.texPositions = positionRead.current.texture;
                velocitySimulationShader.texVelocities = velocityRead.current.texture;
            }

            // Apply force depending on detected pose
            const force = new THREE.Vector3(0, 0, 0);
            const strength = 30.0;

            switch (label.current) {
                case "up":
                    force.set(0, strength, 0); // upwards force flagged by y component
                    break;
                case "wide":
                    force.set(strength*3, 0, 0); // explosion flaggedby x component
                    break;
                case "right":
                    force.set(0, 0, strength/2.0); // rotation flaggedby z component
                    break;
                case "left":
                    force.set(0, 0, -strength/2.0); // rotation flaggedby z component
                    break;
                case "neutral":
                default:
                    force.set(0, 0, 0);
            }

            velocitySimulationShader.uForce = force;


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
            deltaHistory.current.push(delta);
            if (deltaHistory.current.length > 30) deltaHistory.current.shift();
            const avgDelta = deltaHistory.current.reduce((a, b) => a + b, 0) / deltaHistory.current.length;
            if (avgDelta > 1 / 4) { // average is worse than 4 FPS
                resetTextures(gl);
            }

            computeVelocitySimulation(delta, gl);
            computePositionSimulation(delta, clock.elapsedTime, gl);
            gl.setRenderTarget(null);
            particleShader.texPositions = positionWrite.current.texture;

            const referenceCount = ParticleCount.Medium;
            const actualCount = textureSizeToParticleCount(particleTextureSize);
            particleShader.uIntensityScale = referenceCount / actualCount;

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
}));

export default ParticleSimulation
