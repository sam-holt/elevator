import { Canvas } from "@react-three/fiber"
import { Experience } from "./components/Experience"

function Application() {
  return <Canvas shadows camera={{ position: [0, 4, 20], fov: 45 }}>
      <color attach="background" args={["#ececec"]} />
      <Experience />
  </Canvas>
}

export default Application;
