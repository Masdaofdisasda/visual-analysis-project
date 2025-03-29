import React, {useMemo, useState} from 'react';
import {Points} from "@react-three/drei";

interface ParticleFieldProps {
    count?: number;
}

const ParticleField: React.FC<ParticleFieldProps> = ({ count = 1000 }) => {
    const [radius, setRadius] = useState(1)
    const positions = useMemo(() => {
        const positions = []
        for (let i = 0; i < count; i++) {
            positions.push(
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
                Math.random() * 2 - 1
            )
        }
        return new Float32Array(positions)
    }, [count])
    const colors = useMemo(() => {
        const colors = []
        for (let i = 0; i < count; i++) {
            colors.push(
                Math.random(),
                Math.random(),
                Math.random()
            )
        }
        return new Float32Array(colors)
    }, [count]);
    const sizes = useMemo(() => {
        const sizes = []
        for (let i = 0; i < count; i++) {
            sizes.push(0.02)
        }
        return new Float32Array(sizes)
    }, [count]);

    return (
        <Points
            positions={positions}
            colors={colors}
            sizes={sizes}
        >
            <meshBasicMaterial vertexColors={true}/>
        </Points>
    );
};

export default ParticleField;
