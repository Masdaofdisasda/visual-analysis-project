import * as THREE from "three";
import {useEffect, useRef, useState} from "react";

/**
 * A hook to create and manage a ping-pong texture setup using Frame Buffer Objects (FBOs).
 *
 * @returns - An object containing:
 *   - readTarget - The current texture being read.
 *   - writeTarget - The current texture being written to.
 *   - swap - A function to swap the read and write targets.
 * @param particleTextureSize - The size of the particle texture (width and height).
 */
function usePingPongTexture(particleTextureSize: number) {
    const [targets, setTargets] = useState(() => createTargets(particleTextureSize));
    const readTarget = useRef(targets[0]);
    const writeTarget = useRef(targets[1]);

    function swap() {
        const temp = readTarget.current;
        readTarget.current = writeTarget.current;
        writeTarget.current = temp;
    }

    useEffect(() => {
        const [newA, newB] = createTargets(particleTextureSize);

        // Dispose old targets
        readTarget.current.dispose?.();
        writeTarget.current.dispose?.();

        readTarget.current = newA;
        writeTarget.current = newB;
        setTargets([newA, newB]);
    }, [particleTextureSize]);

    return {
        readTarget,
        writeTarget,
        swap
    };
}

function createTargets(size: number): [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget] {
    const options = {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
    };

    const rtA = new THREE.WebGLRenderTarget(size, size, options);
    const rtB = new THREE.WebGLRenderTarget(size, size, options);

    return [rtA, rtB];
}

export default usePingPongTexture;
