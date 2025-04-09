// based on https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/

import * as THREE from "three";
import {shaderMaterial} from "@react-three/drei";

import simulationVertexShader from '../shaders/simulationVertex.glsl?raw';
import posSimulationFragmentShader from '../shaders/positionSimulationFragment.glsl?raw';
import velSimulationFragmentShader from '../shaders/velocitySimulationFragment.glsl?raw';

function createPositionSimulationMaterial(texPositions: THREE.Texture, texVelocities: THREE.Texture) {
    return shaderMaterial( {
        texPositions: texPositions,
        texVelocities: texVelocities,
        uDeltaTime: 0,
        uTime: 0,
        uMaxLife: 10,
    },  simulationVertexShader, posSimulationFragmentShader)
}

export type VelocitySimulationMaterialInstance = InstanceType<ReturnType<typeof createVelocitySimulationMaterial>>;

function createVelocitySimulationMaterial(texPositions: THREE.Texture, texVelocities: THREE.Texture) {
    return shaderMaterial( {
        texPositions: texPositions,
        texVelocities: texVelocities,
        uDeltaTime: 0,
        uMaxLife: 10,
        uForce: new THREE.Vector3(0, 0, 0),
        uDamping: 0.99,
        uBoundaryRadius: 100.0,
        uCurlStrength: 1.0
    },  simulationVertexShader, velSimulationFragmentShader)
}

export type PositionSimulationMaterialInstance = InstanceType<ReturnType<typeof createPositionSimulationMaterial>>;

export { createPositionSimulationMaterial, createVelocitySimulationMaterial };
