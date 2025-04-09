import {
    createVelocitySimulationMaterial,
    VelocitySimulationMaterialInstance
} from "../material/SimulationMaterial.tsx";
import {forwardRef, useMemo} from "react";
import * as THREE from "three";
import useQuadGeometry from "../hooks/useQuadGeometry.tsx";
import {createPortal} from "@react-three/fiber";

export type VelocitySimulationPassProps = {
    size: number;
    texPositions: THREE.DataTexture;
    texVelocities: THREE.DataTexture;
    setSceneRef: (scene: THREE.Scene) => void;
}

const VelocitySimulationPass = forwardRef<VelocitySimulationMaterialInstance | null, VelocitySimulationPassProps>(
        function VelocitySimulationPass(
        { size, texPositions, texVelocities, setSceneRef }: VelocitySimulationPassProps, ref
    ) {
    const VelocitySimulationMaterial = createVelocitySimulationMaterial(texPositions, texVelocities);

    const velocitySimulationShader = useMemo(
        () => new VelocitySimulationMaterial(size), [size]);
    const velocityScene = useMemo(() => new THREE.Scene(), []);
    setSceneRef(velocityScene);

    const { positions, uvs } = useQuadGeometry();

    return createPortal(
        <mesh>
            <primitive ref={ref} object={velocitySimulationShader} attach="material" />
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
})

export default VelocitySimulationPass;
