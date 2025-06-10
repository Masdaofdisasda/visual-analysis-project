import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, RefObject } from 'react'
import * as THREE from 'three'
import type { Label } from './DjPoseApp.types'
import {OrbitControls as OrbitControlsImpl} from "three-stdlib/controls/OrbitControls";

const _sph = new THREE.Spherical()

function CameraController({ detectedLabel }: { detectedLabel: RefObject<Label> }) {
    const controls = useRef<typeof OrbitControlsImpl | null>(null)
    const { camera } = useThree()

    useFrame((_, delta) => {
        const ctrl = controls.current
        if (!ctrl) return

        const label = detectedLabel.current
        const speed = label === 'left' ? +5 : label === 'right' ? -5 : 0
        ctrl.autoRotate       = speed !== 0
        ctrl.autoRotateSpeed  = speed

        const targetZ = label === 'wide' ? 6 : 1
        _sph.setFromVector3(camera.position)
        _sph.radius = THREE.MathUtils.lerp(_sph.radius, targetZ, 3 * delta)
        camera.position.setFromSpherical(_sph)

        ctrl.update()
    })

    return <OrbitControls ref={controls} enableZoom={false} />
}

export default CameraController
