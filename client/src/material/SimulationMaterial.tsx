// based on https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/

import * as THREE from "three";
import {shaderMaterial} from "@react-three/drei";

import simulationVertexShader from '../shaders/simulationVertex.glsl?raw';
import posSimulationFragmentShader from '../shaders/positionSimulationFragment.glsl?raw';
import velSimulationFragmentShader from '../shaders/velocitySimulationFragment.glsl?raw';

export function getPositionData(width: number, height: number, radius = 2, maxLife = 10) {
    const length = width * height * 4;
    const data = new Float32Array(length);

    for (let i = 0; i < length; i += 4) {
        // Random direction
        const theta = Math.acos((Math.random() * 2) - 1); // [0..π]
        const phi = Math.random() * 2 * Math.PI;          // [0..2π]

        // Random distance <= radius
        const r = radius * Math.cbrt(Math.random());

        // Convert spherical -> Cartesian
        const sinTheta = Math.sin(theta);
        data[i + 0] = r * sinTheta * Math.cos(phi); // x
        data[i + 1] = r * sinTheta * Math.sin(phi); // y
        data[i + 2] = r * Math.cos(theta);          // z
        data[i + 3] = Math.random() * maxLife;      // w (lifetime)
    }

    return data;
}

export function getVelocityData(width: number, height: number, velocityScale = 0.1) {
    const length = width * height * 4;
    const data = new Float32Array(length);

    for (let i = 0; i < length; i += 4) {
        // small random velocity in [-velocityScale..velocityScale]
        data[i + 0] = (Math.random() - 0.5) * 2 * velocityScale;
        data[i + 1] = (Math.random() - 0.5) * 2 * velocityScale;
        data[i + 2] = (Math.random() - 0.5) * 2 * velocityScale;
        data[i + 3] = 1.0; // w (unused or damping factor if you want per-particle)
    }

    return data;
}

function createPositionSimulationMaterial(texPositions: THREE.Texture, texVelocities: THREE.Texture) {
    return shaderMaterial( {
        texPositions: texPositions,
        texVelocities: texVelocities,
        uDeltaTime: 0,
        uTime: 0,
        uMaxLife: 10,
    },  simulationVertexShader, posSimulationFragmentShader)
}

function createVelocitySimulationMaterial(texPositions: THREE.Texture, texVelocities: THREE.Texture) {
    return shaderMaterial( {
        texPositions: texPositions,
        texVelocities: texVelocities,
        uDeltaTime: 0,
        uForce: new THREE.Vector3(0, 0, 0),
        uDamping: 0.99,
        uBoundaryRadius: 2.0,
        uCurlStrength: 1.0
    },  simulationVertexShader, velSimulationFragmentShader)
}


export { createPositionSimulationMaterial, createVelocitySimulationMaterial };
