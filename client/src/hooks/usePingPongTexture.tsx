import {useFBO} from "@react-three/drei";
import * as THREE from "three";
import {useRef} from "react";

/**
 * A hook to create and manage a ping-pong texture setup using Frame Buffer Objects (FBOs).
 *
 * @param size - The size of the textures (width and height).
 * @returns - An object containing:
 *   - readTarget - The current texture being read.
 *   - writeTarget - The current texture being written to.
 *   - swap - A function to swap the read and write targets.
 */
function usePingPongTexture(
    size: number,
) {
    const renderTargetA = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
    });
    const renderTargetB = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
    });
    const readTarget = useRef(renderTargetA);
    const writeTarget = useRef(renderTargetB);

    function swap() {
        const temp = readTarget.current;
        readTarget.current = writeTarget.current;
        writeTarget.current = temp;
    }

    return {
        readTarget,
        writeTarget,
        swap
    }
}

export default usePingPongTexture;
