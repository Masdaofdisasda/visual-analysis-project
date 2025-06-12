import * as THREE from "three";
import {createPositionSimulationMaterial} from "../material/SimulationMaterial.tsx";
import {useMemo} from "react";
import useQuadGeometry from "../hooks/useQuadGeometry.tsx";
import {createPortal} from "@react-three/fiber";

function usePositionSimulationPass(
    texPositions: THREE.DataTexture,
    texVelocities: THREE.DataTexture,
) {
    const PositionSimulationMaterial = createPositionSimulationMaterial(texPositions, texVelocities);
    const positionSimulationShader = useMemo(
        () => new PositionSimulationMaterial(), [PositionSimulationMaterial]);
    const positionScene = useMemo(() => new THREE.Scene(), []);
    const { positions, uvs } = useQuadGeometry();

    const positionComponent = createPortal(
        <mesh>
            <primitive object={positionSimulationShader} attach="material" />
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
        positionScene
    )

    return { positionSimulationShader, positionScene, positionComponent };
}

export default  usePositionSimulationPass;
