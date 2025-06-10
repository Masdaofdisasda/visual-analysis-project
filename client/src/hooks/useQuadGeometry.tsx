/**
 * A hook to generate quad geometry data for rendering.
 * This hook provides position and UV coordinates for a quad (rectangle) in 3D space.
 *
 * @returns - An object containing:
 *   - positions - The vertex positions of the quad in 3D space.
 *   - uvs - The UV coordinates for texture mapping on the quad.
 */
function useQuadGeometry(): { positions: Float32Array<ArrayBuffer>; uvs: Float32Array<ArrayBuffer> } {

    // Geometry arrays
    const positions = new Float32Array([
                -1, -1, 0,
                1, -1, 0,
                1,  1, 0,
                -1, -1, 0,
                1,  1, 0,
                -1,  1, 0,
            ]);

    const uvs = new Float32Array([
                0, 0, // bottom-left
                1, 0, // bottom-right
                1, 1, // top-right
                0, 0, // bottom-left
                1, 1, // top-right
                0, 1, // top-left
            ]);

    return {positions, uvs};
}

export default useQuadGeometry;
