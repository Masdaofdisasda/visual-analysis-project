import {createPortal} from "@react-three/fiber";
import {createVelocitySimulationMaterial} from "../material/SimulationMaterial.tsx";
import {useMemo} from "react";
import * as THREE from "three";
import useQuadGeometry from "../hooks/useQuadGeometry.tsx";

function useVelocitySimulationPass(
    size: number,
    texPositions: THREE.DataTexture,
    texVelocities: THREE.DataTexture,
) {
    const VelocitySimulationMaterial = createVelocitySimulationMaterial(texPositions, texVelocities);

    const velocitySimulationShader = useMemo(
        () => new VelocitySimulationMaterial(size), [VelocitySimulationMaterial, size]);
    const velocityScene = useMemo(() => new THREE.Scene(), []);

    const { positions, uvs } = useQuadGeometry();
    const velocityComponent = createPortal(
        <mesh>
            <primitive object={velocitySimulationShader} attach="material" />
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-uv"
                    args={[uvs, 2]}
                />
            </bufferGeometry>
        </mesh>,
        velocityScene
    )

    return { velocitySimulationShader,  velocityScene, velocityComponent };
}

export default useVelocitySimulationPass;
