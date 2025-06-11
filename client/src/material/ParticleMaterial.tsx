import {shaderMaterial} from "@react-three/drei";

import * as THREE from "three";

import vertexShader from '../shaders/particleVertex.glsl?raw';
import fragmentShader from '../shaders/particleFragment.glsl?raw';
import {PARTICLE_COUNT, PARTICLE_TEXTURE_SIZE} from "../components/DjPoseApp.types.ts";

function createParticleMaterial(){
    return shaderMaterial( {
        texPositions:  null as THREE.Texture | null,
        uMaxLife: 10,
        uParticleTextureSize: PARTICLE_TEXTURE_SIZE,
        uParticleCount: PARTICLE_COUNT,
    },  vertexShader, fragmentShader)
}

export type ParticleMaterialInstance = InstanceType<ReturnType<typeof createParticleMaterial>>;


export { createParticleMaterial };
