import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, RefObject } from 'react'
import * as THREE from 'three'
import type { Label } from './DjPoseApp.types'
import {OrbitControls as OrbitControlsImpl} from "three-stdlib/controls/OrbitControls";

const _sph = new THREE.Spherical()

/**
 * React component for controlling the camera in a Three.js scene.
 * This component uses `OrbitControls` to enable camera rotation and adjusts the camera's position
 * and rotation speed based on the detected pose label.
 *
 * @param props - The props for the component.
 * @param props.detectedLabel - Reference to the currently detected pose label.
 * @returns - The rendered camera controller component.
 */
function CameraController({ detectedLabel }: { detectedLabel: RefObject<Label> }) {
    const controls = useRef<typeof OrbitControlsImpl | null>(null)
    const { camera } = useThree()

    useFrame((_, delta) => {
        const ctrl = controls.current
        if (!ctrl) return

        // Adjust camera rotation speed and position based on detected label
        const label = detectedLabel.current
        const speed = label === 'left' ? +5 : label === 'right' ? -5 : 0
        ctrl.autoRotate       = speed !== 0
        ctrl.autoRotateSpeed  = speed

        // Adjust camera zoom based on label
        const targetZ = label === 'wide' ? 6 : 1
        _sph.setFromVector3(camera.position)
        _sph.radius = THREE.MathUtils.lerp(_sph.radius, targetZ, 3 * delta)
        camera.position.setFromSpherical(_sph)

        ctrl.update()
    })

    return <OrbitControls ref={controls} enableZoom={false} />
}

export default CameraController
