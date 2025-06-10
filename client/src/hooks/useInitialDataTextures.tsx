import * as THREE from "three";

function getPositionData(width: number, height: number, radius = 2, maxLife = 10) {
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

function getVelocityData(width: number, height: number, velocityScale = 0.1) {
    const length = width * height * 4;
    const data = new Float32Array(length);

    for (let i = 0; i < length; i += 4) {
        // small random velocity in [-velocityScale..velocityScale]
        data[i + 0] = (Math.random() - 0.5) * 2 * velocityScale;
        data[i + 1] = (Math.random() - 0.5) * 2 * velocityScale;
        data[i + 2] = (Math.random() - 0.5) * 2 * velocityScale;
        data[i + 3] = 1.0; // w (unused)
    }

    return data;
}

function useInitialDataTextures(size: number) {

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

    return {texPositions, texVelocities};
}

export default useInitialDataTextures;
