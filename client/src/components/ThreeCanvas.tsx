import {Canvas} from "@react-three/fiber";
import {Perf} from "r3f-perf";
import ParticleSimulation, {UniformProps} from "./ParticleSimulation.tsx";
import {OrbitControls} from "@react-three/drei";
import {Label, PARTICLE_COUNT} from "./DjPoseApp.types.ts";
import {memo, RefObject} from "react";
import {EffectComposer, HueSaturation, ToneMapping} from "@react-three/postprocessing";
import {AgXToneMapping} from "three";

export type ThreeCanvasProps = {
    detectedLabel: RefObject<Label>;
    isDebug: boolean;
    uniforms: UniformProps;
}

const ThreeCanvas = memo(function ThreeCanvasComponent({
      detectedLabel,
      isDebug,
    uniforms
    }: ThreeCanvasProps) {
    return (<Canvas
        camera={{position: [0.0, 0.0, 2.0], near: 0.1, far: 100}}
    >
        {import.meta.env.DEV && <Perf position="top-left" style={{opacity: isDebug ? 1 : 0, transition: 'opacity 0.5s'}} />}
        <ParticleSimulation uniforms={uniforms} size={PARTICLE_COUNT} label={detectedLabel}/>
        <OrbitControls autoRotate />
        <EffectComposer >
            {/*<DepthOfField
                focusDistance={0.05}
                focalLength={0.02}
                bokehScale={2}
                target={[0, 0, 0]}
            />*/}

            <HueSaturation hue={0.0} saturation={0.0} />
            <ToneMapping mode={AgXToneMapping} />
        </EffectComposer>
    </Canvas>)
});

export default ThreeCanvas;
