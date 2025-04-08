import {useFBO} from "@react-three/drei";
import * as THREE from "three";
import {useRef} from "react";

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
