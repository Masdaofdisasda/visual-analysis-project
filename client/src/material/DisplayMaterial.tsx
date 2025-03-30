import {shaderMaterial} from "@react-three/drei";

import * as THREE from "three";

import vertexShader from '../shaders/particleVertex.glsl?raw';
import fragmentShader from '../shaders/particleFragment.glsl?raw';

function createDisplayMaterial() {
    return shaderMaterial( {
        uPositions: { value: null as unknown as THREE.Texture}
    },  vertexShader, fragmentShader)
}

export { createDisplayMaterial };
