import {createPortal, extend, useFrame} from "@react-three/fiber";
import {useMemo, useRef} from "react";
import * as THREE from "three";
import {useFBO} from "@react-three/drei";
import {createSimulationMaterial} from "../material/SimulationMaterial.tsx";
import {createDisplayMaterial} from "../material/DisplayMaterial.tsx";

const SIZE = 1024;

const SimulationMaterial = createSimulationMaterial(SIZE);
const DisplayMaterial = createDisplayMaterial();

extend({ SimulationMaterial });
extend({ DisplayMaterial });

type FboParticlesProps = {
    size: number;
}

function FboParticles({ size = SIZE }: FboParticlesProps) {
    const particleMaterialRef = useRef<THREE.ShaderMaterial>(null);
    const simulationMaterialRef = useRef<THREE.ShaderMaterial>(null);

    const offLineScene = useMemo(() => new THREE.Scene(), []);
    const camera = useMemo(
        () =>
            new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1),
        []
    );

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

    // Generate our positions attributes array
    const particlesPosition = useMemo(() => {
        const length = size * size;
        const particles = new Float32Array(length * 3);
        for (let i = 0; i < length; i++) {
            const i3 = i * 3;
            particles[i3 + 0] = (i % size) / size;
            particles[i3 + 1] = i / (size * size);
            particles[i3 + 2] = 0;
        }
        return particles;
    }, [size]);

    useFrame((state, delta) => {
        const { gl } = state;

        // (1) Set simulation uniforms
        if (simulationMaterialRef.current) {
            simulationMaterialRef.current.uniforms.uDeltaTime.value = delta;
        }

        // (2) Render the offscreen (simulation) pass → writeTarget
        gl.setRenderTarget(writeTarget.current);
        gl.clear();
        gl.render(offLineScene, camera);
        gl.setRenderTarget(null);

        // (3) Use writeTarget’s updated texture in the display pass
        if (particleMaterialRef.current && particleMaterialRef.current.uniforms?.texPositions) {
                particleMaterialRef.current.uniforms.texPositions.value = writeTarget.current.texture;
        }

        if (simulationMaterialRef.current) {
            simulationMaterialRef.current.uniforms.texBuffer.value = writeTarget.current.texture;
        }

        const temp = readTarget.current;
        readTarget.current = writeTarget.current;
        writeTarget.current = temp;

    });

    const simulationPass = createPortal(
        <mesh>
            <simulationMaterial ref={simulationMaterialRef} args={[size]}/>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-uv"
                    count={uvs.length / 2}
                    array={uvs}
                    itemSize={2}
                />
            </bufferGeometry>
        </mesh>,
        offLineScene
    )

    const particlePass = <points>
        <bufferGeometry>
            <bufferAttribute
                attach="attributes-position"
                count={particlesPosition.length / 3}
                array={particlesPosition}
                itemSize={3}
            />
        </bufferGeometry>
        <displayMaterial
            ref={particleMaterialRef}
            blending={THREE.AdditiveBlending}
            depthTest={false}
            attach="material"
        />
    </points>

    return (
        <group>
            {simulationPass}
            {particlePass}
        </group>
    );
}

export default FboParticles
