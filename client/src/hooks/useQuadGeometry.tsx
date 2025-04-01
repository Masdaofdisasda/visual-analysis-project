import {useMemo} from "react";

function useQuadGeometry(): { positions: Float32Array<ArrayBuffer>; uvs: Float32Array<ArrayBuffer> } {

    // Geometry arrays
    const positions = useMemo(
        () =>
            new Float32Array([
                -1, -1, 0,
                1, -1, 0,
                1,  1, 0,
                -1, -1, 0,
                1,  1, 0,
                -1,  1, 0,
            ]),
        []
    );

    const uvs = useMemo(
        () =>
            new Float32Array([
                0, 0, // bottom-left
                1, 0, // bottom-right
                1, 1, // top-right
                0, 0, // bottom-left
                1, 1, // top-right
                0, 1, // top-left
            ]),
        []
    );
    return {positions, uvs};
}

export default useQuadGeometry;
