import {createPositionSimulationMaterial, PositionSimulationMaterialInstance} from "../material/SimulationMaterial.tsx";
import {forwardRef, useMemo} from "react";
import * as THREE from "three";
import useQuadGeometry from "../hooks/useQuadGeometry.tsx";
import {createPortal} from "@react-three/fiber";

export type PositionSimulationPassProps = {
    size: number;
    texPositions: THREE.DataTexture;
    texVelocities: THREE.DataTexture;
    setScene: (scene: THREE.Scene) => void;
}

const PositionSimulationPass = forwardRef<PositionSimulationMaterialInstance | null, PositionSimulationPassProps>(
    function PositionSimulationPass(
        { size, texPositions, texVelocities, setScene }: PositionSimulationPassProps, ref
    ) {
    const PositionSimulationMaterial = createPositionSimulationMaterial(texPositions, texVelocities);
    const positionSimulationShader = useMemo(
        () => new PositionSimulationMaterial(size), [size]);
    const positionScene = useMemo(() => new THREE.Scene(), []);
    setScene(positionScene);
    const { positions, uvs } = useQuadGeometry();

    return createPortal(
        <mesh>
            <primitive ref={ref} object={positionSimulationShader} attach="material" />
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
})

export default PositionSimulationPass;
