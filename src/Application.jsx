import { Canvas } from "@react-three/fiber"
import { Elevator } from "./Elevator"

function Application() {
  return <Canvas shadows={true} camera={{ position: [0, 7, 16], fov: 45 }}>
      <color attach="background" args={["skyblue"]} />
      <Elevator />
  </Canvas>
}

export default Application;
