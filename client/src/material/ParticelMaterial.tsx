import {shaderMaterial} from "@react-three/drei";

import * as THREE from "three";

import vertexShader from '../shaders/particleVertex.glsl?raw';
import fragmentShader from '../shaders/particleFragment.glsl?raw';

function createParticleMaterial() {
    return shaderMaterial( {
        texPositions:  null as THREE.Texture | null
    },  vertexShader, fragmentShader)
}

export { createParticleMaterial };
