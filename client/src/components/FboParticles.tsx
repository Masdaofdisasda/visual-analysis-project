import {createPortal, extend, useFrame} from "@react-three/fiber";
import {useMemo, useRef} from "react";
import * as THREE from "three";
import {useFBO} from "@react-three/drei";
import {
    createPositionSimulationMaterial,
    createVelocitySimulationMaterial, getRandomData,
    getZeroVelocityData
} from "../material/SimulationMaterial.tsx";
import {createDisplayMaterial} from "../material/DisplayMaterial.tsx";

const SIZE = 1024;

const texPositions = new THREE.DataTexture(
    getRandomData(SIZE, SIZE),
    SIZE,
    SIZE,
    THREE.RGBAFormat,
    THREE.FloatType
);
texPositions.needsUpdate = true;
const texVelocities = new THREE.DataTexture(
    getZeroVelocityData(SIZE, SIZE),
    SIZE,
    SIZE,
    THREE.RGBAFormat,
    THREE.FloatType
);
texVelocities.needsUpdate = true;

const PositionSimulationMaterial = createPositionSimulationMaterial(texPositions, texVelocities);
const VelocitySimulationMaterial = createVelocitySimulationMaterial(texPositions, texVelocities);
const DisplayMaterial = createDisplayMaterial();

extend({ PositionSimulationMaterial });
extend({ VelocitySimulationMaterial });
extend({ DisplayMaterial });

type FboParticlesProps = {
    size: number;
}

function FboParticles({ size = SIZE }: FboParticlesProps) {
    const particleMaterialRef = useRef<THREE.ShaderMaterial>(null);
    const positionSimulationMaterialRef = useRef<THREE.ShaderMaterial>(null);
    const velocitySimulationMaterialRef = useRef<THREE.ShaderMaterial>(null);

    const positionScene = useMemo(() => new THREE.Scene(), []);
    const velocityScene = useMemo(() => new THREE.Scene(), []);
    const simulationCamera = useMemo(
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

    const positionRT_A = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
    });
    const positionsRT_B = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
    });
    const velocityRT_A = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
    });
    const velocityRT_B = useFBO(size, size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        type: THREE.FloatType,
    });
    const positionRead = useRef(positionRT_A);
    const positionWrite = useRef(positionsRT_B);
    const velocityRead = useRef(velocityRT_A);
    const velocityWrite = useRef(velocityRT_B);

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

    useFrame(({ gl }, delta) => {
        // (1) Set simulation uniforms

        if (velocitySimulationMaterialRef.current) {
            velocitySimulationMaterialRef.current.uniforms.uDeltaTime.value = delta;
            velocitySimulationMaterialRef.current.uniforms.uGlobalForce.value = new THREE.Vector3(0, 0, 0);
        }

        gl.setRenderTarget(velocityWrite.current);
        gl.clear();
        gl.render(velocityScene, simulationCamera);

        if (positionSimulationMaterialRef.current) {
            positionSimulationMaterialRef.current.uniforms.uDeltaTime.value = delta;
        }

        gl.setRenderTarget(positionWrite.current);
        gl.clear();
        gl.render(positionScene, simulationCamera);
        gl.setRenderTarget(null);

        if (particleMaterialRef.current && particleMaterialRef.current.uniforms?.texPositions) {
                particleMaterialRef.current.uniforms.texPositions.value = positionWrite.current.texture;
        }

        if (velocitySimulationMaterialRef.current) {
            velocitySimulationMaterialRef.current.uniforms.texPositions.value = positionWrite.current.texture;
            velocitySimulationMaterialRef.current.uniforms.texVelocities.value = velocityWrite.current.texture;
        }

        if (positionSimulationMaterialRef.current) {
            positionSimulationMaterialRef.current.uniforms.texPositions.value = positionWrite.current.texture;
            positionSimulationMaterialRef.current.uniforms.texVelocities.value = velocityWrite.current.texture;
        }

        let temp = positionRead.current;
        positionRead.current = positionWrite.current;
        positionWrite.current = temp;
        temp = velocityRead.current;
        velocityRead.current = velocityWrite.current;
        velocityWrite.current = temp;

    });

    const posSimulationPass = createPortal(
        <mesh>
            <positionSimulationMaterial ref={positionSimulationMaterialRef} args={[size]}/>
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
        positionScene
    )
    const velSimulationPass = createPortal(
        <mesh>
            <velocitySimulationMaterial ref={velocitySimulationMaterialRef} args={[size]}/>
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
        velocityScene
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
            {velSimulationPass}
            {posSimulationPass}
            {particlePass}
        </group>
    );
}

export default FboParticles
