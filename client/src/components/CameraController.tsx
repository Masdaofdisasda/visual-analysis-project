import { useFrame } from "@react-three/fiber";
import { RefObject } from "react";
import { Label } from "./DjPoseApp.types";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type OrbitControlsWithRotate = OrbitControlsImpl & {
  rotateLeft: (angle: number) => void;
  update: () => void;
};

export default function CameraController({
  detectedLabel,
  controlsRef,
}: {
  detectedLabel: RefObject<Label>;
  controlsRef: React.RefObject<OrbitControlsWithRotate | null>;
}) {
  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls || typeof controls.rotateLeft !== "function") return;

    console.log("CameraController useFrame running", detectedLabel.current);

    const label = detectedLabel.current;

    if (label === "left") {
      controls.rotateLeft(0.01);
    } else if (label === "right") {
      controls.rotateLeft(-0.01);
    }

    controls.update();
  });

  return <group />; 
}
