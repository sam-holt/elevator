import { OrbitControls, Html, PresentationControls, useGLTF, Sky } from "@react-three/drei"
import gsap from "gsap"
import { useEffect, useState, useRef, useLayoutEffect } from "react"
import './elevator.css'
import { useFrame } from "@react-three/fiber"
import * as THREE from 'three'

export const Elevator = () => {
  /************************************************************************************************************************ 
  *********************************          States, Constants, and Refs      ****************************************************
  *************************************************************************************************************************/

  //contants
  const floorDistance = 2.2 //controls distance between floors
  const numFloors = 6 //determines number of floors in the building

  //Refs
  const elevatorRef = useRef() //used for animating the elevator car
  const doorLeftRef = useRef()  //used for animating the left door
  const doorRightRef = useRef() //used for animating the right door

  //States
  const [travelTime, setTravelTime] = useState(10) //determines speed of the elevator (time to travel from one floor to the next in seconds)
  const [destinationFloors, setDestinationFloors] = useState([]) //creates a list of floors to visit
  const [totalTravelTime, setTotalTravelTime] = useState(0) //tracks total travel time
  const [visitedFloors, setVisitedFloors] = useState([]) //creates a list of floors that have been visited
  const [currentFloor, setCurrentFloor] = useState(1) //tracks the most recently visited floor 
  const [direction, setDirection] = useState('up') //tracks the direction the elevator is moving
  const [isAnimating, setIsAnimating] = useState(false) //tracks whether the elevator is currently animating (includes door opening and closing in addition to moving between floors)
  const [isTraveling, setIsTraveling] = useState(false) //tracks whether the elevator is currently moving between floors
  const [isOccluded, setIsOccluded] = useState(false) //tracks whether the UI buttons are occluded by other objects in the scene
  const [buttonPosition, setButtonPosition] = useState([3, 4.5, 0]) //state used for positioning the UI buttons, allows for positions to be updated based on screen size

  //models
  const elevator = useGLTF('/models/elevator.glb') //scene including elevator, tower, and surroundings

  /************************************************************************************************************************ 
  *********************************        Hooks     ********************************************************************** 
  *************************************************************************************************************************/

  //when changes are made to the list of destination floors, animate the elevator to the next floor and update the direction if necessary
  useEffect(() => {
    if( destinationFloors.length > 0) {
      if(isAnimating === false && destinationFloors[0] != currentFloor) {
        setIsAnimating(true)
        updateDirection()
        animateElevator()
      } 
    }
  }, [destinationFloors])

  //set up refs for the elevator car and doors and update the materials to allow for shadows
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

  //update the position of the elevator buttons based on screen size
  useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth < 600) {
          setButtonPosition([0, -1, 3])
        } else {
          setButtonPosition([3, 4.5, 0])
        }
      }
      handleResize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
  }, [])

  //update the total travel time when the elevator is moving
  useFrame((state, delta) => {
    if(isTraveling) {
      if (isTraveling) {
        setTotalTravelTime(prev => prev + delta)
      }
    }
    else {
      //correct for slight drift
      setTotalTravelTime(Math.round(totalTravelTime))
    }
  })

  /************************************************************************************************************************ 
  *********************************         JSX      *************************************************************** 
  *************************************************************************************************************************/
  return <>
      <Html fullscreen>
        {/* container for the elevator stats */}
        <div className='stats-container'>
          <div>
            {/* input box for changing the speed */}
            <label htmlFor="travelTime">Travel Speed (Sec/Floor): </label>
            <input id="travelTime" type="number" value={travelTime} onChange={(e) => setTravelTime(Number(e.target.value))} />
          </div>
          <div>
                Current Floor: {currentFloor}
          </div>
          <div >
                Direction: {direction}
          </div>
          <div>
            Total Travel Time: {totalTravelTime.toFixed(2)} seconds
          </div>
          <div>
            Floors visited: {visitedFloors.join(', ')}
          </div>
          {/* button to reset the experience */}
          <div  className='reset-button' onClick={reset}>
            Reset
          </div>
        </div>
      </Html> 

      {/************************************************************************************************************************ 
      *********************************         Lighting        *************************************************************** 
      *************************************************************************************************************************/}

      {/* ambient scene lighting */}
      <ambientLight intensity={0.5} />
      {/* directional light with shadows*/}
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

      {/************************************************************************************************************************ 
      *********************************           Scene          *************************************************************** 
      *************************************************************************************************************************/}

      {/* presentation controls to allow rotation with spring back to intial position */}
      <PresentationControls global cursor snap polar={[0, Math.PI / 4]} > 
        {/* UI for elevator buttons that fades out if it is occluded by other objects in the scene */}
        <Html position={buttonPosition} occlude onOcclude={() => setIsOccluded(!isOccluded)}>
          <div className={`button-container ${isOccluded ? 'occluded' : ''}`}  >
            {Array.from({ length: numFloors }, (_, i) => i + 1).map(floorNumber => (
              <div key={floorNumber} className={`elevator-button ${destinationFloors.includes(floorNumber) ? 'active' : ''}`}
                  onClick={() => { addDestinationFloor(floorNumber) }}>
                {floorNumber}
              </div>
            ))}
          </div>
        </Html>
          
        {/* Title text placed along floor */}
        <Html position={[ 0, -2.2, 3.5 ]} rotation={[ -Math.PI/2, 0, 0 ]} transform>
              <div className='title'>Elevator Simulation</div>
        </Html>

        {/* 3D scene including elevator, tower, and surroundings */}
        <group rotation={[ 0, Math.PI/4, 0 ]} position={[ 0, -2.2, 0 ]}>
            <primitive object={elevator.scene} position={[ 0, 0, 0]} scale={0.5}/>
        </group>
      </PresentationControls>
  </>

  /************************************************************************************************************************ 
  *********************************          Functions       *************************************************************** 
  *************************************************************************************************************************/

  //Function that creates a list of floors to be visited 
  function addDestinationFloor(floor) {
    setDestinationFloors(prevFloors => {
      // Adds a floor to the destination list if it is not already included and is not the current floor
      if (!prevFloors.includes(floor) && floor !== currentFloor) {
        const newFloors = [...prevFloors, floor];
        return sortDestinationFloors(newFloors); // Sorts the list of floors based on direction
      } 
      // if the floor is already in the list or is the current floor, the list is unchanged
      else {
        return prevFloors;
      }
    });
  }

  //Function that sorts the destination floors such that: when moving up, the floors above the currently targeted floor will be sorted in ascending order
  //and the floors below the target floor will be sorted in descending order - when moving down the reverse is applied
  function sortDestinationFloors(floors) {
    const referenceFloor = destinationFloors[0] || currentFloor;
    return [...floors].sort((a, b) => {
      if (direction === 'up') {
        if (a >= referenceFloor && b >= referenceFloor) return a - b;
        if (a >= referenceFloor || b >= referenceFloor) return a >= referenceFloor ? -1 : 1;
        return b - a;
      } else { //if direction is 'down'
        if (a <= referenceFloor && b <= referenceFloor) return b - a;
        if (a <= referenceFloor || b <= referenceFloor) return a <= referenceFloor ? -1 : 1;
        return a - b;
      }
    });
  }

  //function that animates the elevator to the next targeted floor
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

  //function that animates the elevator doors opening and closing
  function openAndCloseDoors() {
    gsap.to(doorLeftRef.current.position, {
      x: 0.3,
      duration: 2,
      onComplete: () => {
          gsap.to(doorLeftRef.current.position, {
              x: 0,
              duration: 2,
              delay: 1,
              onComplete: () => {
                  //when animation is complete, elevator is ready to move to next floor
                  setIsAnimating(false)
                  setDestinationFloors(prevFloors => prevFloors.slice(1))
              }
          })
      }
    })
    gsap.to(doorRightRef.current.position, {
      x: -0.3,
      duration: 2,
      onComplete: () => {
          gsap.to(doorRightRef.current.position, {
              x: 0,
              duration: 2,
              delay: 1
          })
      }
    })
  }

  //updates the direction based on the current floor and the list of destination floors
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

  //resets the experience to its initial state
  function reset() {
    setDestinationFloors([])
    setTravelTime(10)
    setVisitedFloors([])
    setCurrentFloor(1)
    setDirection('up')
    setIsAnimating(false)
    setIsTraveling(false)
    setTotalTravelTime(0)
    gsap.killTweensOf(elevatorRef.current.position)
    elevatorRef.current.position.y = 0
    gsap.killTweensOf(doorLeftRef.current.position)
    doorLeftRef.current.position.y = 0
    gsap.killTweensOf(doorRightRef.current.position)
    doorRightRef.current.position.y = 0
  }

}
