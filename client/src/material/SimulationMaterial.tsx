// based on https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/

import * as THREE from "three";
import {shaderMaterial} from "@react-three/drei";

import simulationVertexShader from '../shaders/simulationVertex.glsl?raw';
import simulationFragmentShader from '../shaders/simulationFragment.glsl?raw';

function getRandomData(width: number, height: number) {
    // we need to create a vec4 since we're passing the positions to the fragment shader
    // data textures need to have 4 components, R, G, B, and A
    const length = width * height * 4
    const data = new Float32Array(length);

    for (let i = 0; i < length; i++) {
        const stride = i * 4;

        const distance = 1.0; // All points will be on the surface of a unit sphere
        const theta = Math.acos(THREE.MathUtils.randFloatSpread(2)); // Polar angle
        const phi = THREE.MathUtils.randFloatSpread(360); // Azimuthal angle

        data[stride] = distance * Math.sin(theta) * Math.cos(phi);
        data[stride + 1] = distance * Math.sin(theta) * Math.sin(phi);
        data[stride + 2] = distance * Math.cos(theta);
        data[stride + 3] = 1.0; // this value will not have any impact
    }

    return data;
}

function createPositionSimulationMaterial(size: number) {
    const bufferTexture = new THREE.DataTexture(
        getRandomData(size, size),
        size,
        size,
        THREE.RGBAFormat,
        THREE.FloatType
    );
    bufferTexture.needsUpdate = true;

    return shaderMaterial( {
        texBuffer: bufferTexture,
        uFrequency: 0.25,
        uDeltaTime: 0,
    },  simulationVertexShader, simulationFragmentShader)
}


export { createPositionSimulationMaterial };
