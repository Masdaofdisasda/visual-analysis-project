import './App.css'
import {Canvas} from "@react-three/fiber";
import {OrbitControls} from "@react-three/drei";
import { Perf } from 'r3f-perf';
import PoseComponent from "./components/PoseComponent.tsx";
import FboParticles from "./components/FboParticles.tsx";

function App() {
  return (
      <div className={"h-screen w-screen"}>
          <Canvas camera={{ position: [1.0, 1.0, 0.5] }}>
              <Perf position="top-left" />
              <ambientLight intensity={0.5} />
              <FboParticles size={1024} />
              <OrbitControls />
          </Canvas>
          <PoseComponent />
      </div>
  )
}

export default App
