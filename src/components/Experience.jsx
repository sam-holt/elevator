import { OrbitControls, Html, PresentationControls, useGLTF } from "@react-three/drei"
import gsap from "gsap"
import { useEffect, useState, useRef, useLayoutEffect } from "react"
import './experience.css'
import { useFrame } from "@react-three/fiber"
import * as THREE from 'three'

export const Experience = () => {
  const elevatorRef = useRef()
  const doorLeftRef = useRef()
  const doorRightRef = useRef()
  const floorDistance = 2.2
  const numFloors = 6
  const [travelTime, setTravelTime] = useState(2)
  const [destinationFloors, setDestinationFloors] = useState([])
  const [totalTravelTime, setTotalTravelTime] = useState(0)
  const [visitedFloors, setVisitedFloors] = useState([])
  const [currentFloor, setCurrentFloor] = useState(1)
  const [direction, setDirection] = useState('up')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isTraveling, setIsTraveling] = useState(false)
  const elevator = useGLTF('/models/elevator.glb')

  useEffect(() => {
    if( destinationFloors.length > 0) {
      if(isAnimating === false && destinationFloors[0] != currentFloor) {
        setIsAnimating(true)
        updateDirection()
        animateElevator()
      } 
    }
  }, [destinationFloors])

  useLayoutEffect(() => {
    elevator.scene.traverse((child) => {
      if(child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
      if (child.name === 'Elevator') {
        elevatorRef.current = child
      }
      if (child.name === 'Door_Right') {
        doorRightRef.current = child
        doorRightRef.current.material = new THREE.MeshStandardMaterial({color:'silver'})
      }
      if (child.name === 'Door_Left') {
        doorLeftRef.current = child
        doorLeftRef.current.material = new THREE.MeshStandardMaterial({color:'silver'})

      }

    })

  },[])

  useFrame((state, delta) => {
    if(isTraveling) {
      //add to total travel time if elevator is moving
      if (isTraveling) {
        setTotalTravelTime(prev => prev + delta)
      }
    }
    else {
      //round total travel time if elevator is not moving to correct for slight drift
      setTotalTravelTime(Math.round(totalTravelTime))
    }
  })

  return <>
      <Html fullscreen>
        <div>
        <label htmlFor="travelTime">Speed (Travel Time Per Floor in Seconds): </label>
        <input 
          id="travelTime"
          type="number"
          value={travelTime}
          onChange={(e) => setTravelTime(Number(e.target.value))}
        />
        </div>
        <div  onClick={reset}>
          Reset
        </div>
        <div>
          Total Travel Time: {totalTravelTime.toFixed(2)} seconds
        </div>
        <div>
          Current Floor: {currentFloor}
        </div>
        <div>
          Direction: {direction}
        </div>
        <div>
          Destination Floors: {destinationFloors.join(', ')}
        </div>
        <div>
          Floors visited: {visitedFloors.join(', ')}
        </div>
        {Array.from({ length: numFloors }, (_, i) => i + 1).map(floorNumber => (
          <div key={floorNumber} className='elevator-button' 
              style={{backgroundColor: destinationFloors.includes(floorNumber) ? 'yellow' : ''}}
              onClick={()=>{ addDestinationFloor(floorNumber)}}>
              {floorNumber}
          </div>
        ))}
      </Html>

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 7, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.01}
        shadow-camera-far={20}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.001}
      />

      {/* <OrbitControls enablePan={false}/> */}
      <PresentationControls global cursor snap polar={[0, Math.PI / 4]} >
        <group rotation={[ 0, Math.PI/4, 0 ]} position={[ 0, -2.2, 0 ]}>
            <primitive object={elevator.scene} position={[ 0, 0, 0]} scale={0.5}/>
        </group>
      </PresentationControls>
  </>

  //Function that creates a list of floors to visit 
  function addDestinationFloor(floor) {
    setDestinationFloors(prevFloors => {
      // Adds a floor to the destination list if it is not already included or if it is the current floor
      if (!prevFloors.includes(floor) && floor !== currentFloor) {
        const newFloors = [...prevFloors, floor];
        return sortDestinationFloors(newFloors); // Sort floors before returning
      } 
      // Otherwise returns the current list
      else {
        return prevFloors;
      }
    });
  }

    //sorts the destination floors such that when moving up, the floors above will be sorted in ascending order
    //and the floors below will be sorted in descending order, and vice versa when moving down
    function sortDestinationFloors(floors) {
      const referenceFloor = destinationFloors[0] || currentFloor;
      return [...floors].sort((a, b) => {
        if (direction === 'up') {
          if (a >= referenceFloor && b >= referenceFloor) return a - b;
          if (a >= referenceFloor || b >= referenceFloor) return a >= referenceFloor ? -1 : 1;
          return b - a;
        } else { // direction === 'down'
          if (a <= referenceFloor && b <= referenceFloor) return b - a;
          if (a <= referenceFloor || b <= referenceFloor) return a <= referenceFloor ? -1 : 1;
          return a - b;
        }
      });
    }

  function animateElevator() {
    gsap.to(elevatorRef.current.position, {
      y: (destinationFloors[0] - 1) * floorDistance,
      duration: travelTime * Math.abs(destinationFloors[0] - currentFloor),
      onStart: () => {
        setIsTraveling(true)
      },
      onComplete: () => {
          setIsTraveling(false)
          setCurrentFloor(destinationFloors[0])
          setVisitedFloors(prevFloors => [...prevFloors, destinationFloors[0]])
          openAndCloseDoors()
      }
    })
    gsap.to(doorLeftRef.current.position, {
      y: (destinationFloors[0] - 1) * floorDistance,
      duration: travelTime * Math.abs(destinationFloors[0] - currentFloor),
    })
    gsap.to(doorRightRef.current.position, {
      y: (destinationFloors[0] - 1) * floorDistance,
      duration: travelTime * Math.abs(destinationFloors[0] - currentFloor),
    })
  }

  function openAndCloseDoors() {
    gsap.to(elevatorRef.current.scale, {
      z: 1.5,
      duration: 2,
      onComplete: () => {
          gsap.to(elevatorRef.current.scale, {
              z: 1,
              duration: 2,
              delay: 1,
              onComplete: () => {
                  setIsAnimating(false)
                  setDestinationFloors(prevFloors => prevFloors.slice(1))
              }
          })
      }
    })
  }

  function updateDirection() {
    if (direction === 'up') {
      const hasFloorAbove = destinationFloors.some(floor => floor > currentFloor)
      if (!hasFloorAbove || currentFloor === numFloors) {
          setDirection('down')
      }
    } else {
        const hasFloorBelow = destinationFloors.some(floor => floor < currentFloor)
        if (!hasFloorBelow || currentFloor === 1) {
            setDirection('up')
        }
    }
  }

  function reset() {
    setDestinationFloors([])
    setTravelTime(2)
    setVisitedFloors([])
    setCurrentFloor(1)
    setDirection('up')
    setIsAnimating(false)
    setIsTraveling(false)
    setTotalTravelTime(0)
    gsap.killTweensOf(elevatorRef.current.position)
    elevatorRef.current.position.y = 0
  }

}
