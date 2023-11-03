import { Canvas } from "@react-three/fiber"
import { Experience } from "./components/Experience"

function Application() {
  return <Canvas shadows={true} camera={{ position: [0, 7, 16], fov: 45 }}>
      <color attach="background" args={["skyblue"]} />
      <Experience />
  </Canvas>
}

export default Application;
