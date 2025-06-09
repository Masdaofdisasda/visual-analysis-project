import { useFrame, useThree } from "@react-three/fiber";
import { RefObject, useRef } from "react";
import { Label } from "./DjPoseApp.types";
import * as THREE from "three";

export default function CameraController({
  detectedLabel,
}: {
  detectedLabel: RefObject<Label>;
}) {
  const { camera } = useThree();
  const rotationVelocity = useRef(0);
  const defaultZoom = 4; // Ausgangszoom

  useFrame(() => {
    const label = detectedLabel.current;

    // Rotation control
    if (label === "left") {
      rotationVelocity.current = 0.01;
    } else if (label === "right") {
      rotationVelocity.current = -0.01;
    } else {
      rotationVelocity.current = 0; // no rotation change
    }

    // Apply rotation around Y axis (camera orbits the center endlessly)
    const radius = Math.sqrt(
      camera.position.x * camera.position.x +
      camera.position.z * camera.position.z
    );
    const angle = Math.atan2(camera.position.z, camera.position.x) + rotationVelocity.current;
    camera.position.x = radius * Math.cos(angle);
    camera.position.z = radius * Math.sin(angle);

    // Zoom control
    if (label === "wide") {
      camera.position.z += 0.05;
    } else if (label === "neutral") {
      camera.position.z += (defaultZoom - camera.position.z) * 0.02;
    }

    camera.lookAt(0, 0, 0);
  });

  return <group />;
}
