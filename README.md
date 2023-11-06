# Elevator Simulation
![elevatorSimulation](https://github.com/sam-holt/elevator/assets/67719990/030d87c1-25ec-4a36-9554-8aaff5221586)

## About

A 3D Elevator Simulation made using JavaScript, Three.js, React-three-fiber, Blender, HTML, and CSS. View the live demo [here](https://threedkit-f69afd8478fc.herokuapp.com/)!

## Index

- [About](#about)
- [Setup](#setup)
- [Features](#features)
- [Missing Features and Areas for Improvement](#missing-features-and-areas-for-improvement)
- [Sources](#sources)

## Setup

View the [live demo](https://threedkit-f69afd8478fc.herokuapp.com/) or follow the instructions below to run the project locally:

### Prerequisites

- Node.js
- npm

### Steps to Run Locally

- Once Node.js and npm have been installed use a terminal to navigate to your desired directory and clone the repository using:
  ```
  git clone https://github.com/sam-holt/elevator.git
  ```
- navigate to the newly created directory and run:
   ```
  npm install
  npm run dev
  ```
- follow the provided localhost link to run the experience in your browser

## Features

- 3D visualization with animations, shadows, and interactive camera
- Selected floors are visited in optimized order based on the current direction
- Live display of the total travel time
- List of floors that have been visited
- Adjustable travel speed based on user input
- Reset button
- Live updating of current floor and travel direction
- Buttons are illuminated to indicate selected floors that have not been visited
- Button UI rotates with scene and fades out if occluded

## Missing Features and Areas for Improvement

- The logic for "current floor" could be improved to update during travel as it currently indictes the most recently visited floor. This prevents the starting floor from being selected until another floor is visited.
- The current UI is very simplistic and could be improved greatly
- Although the number of floors that the elevator can visit is flexible the 3D model is not dynamic and will not reflect these changes
- Responsitivity (both for the UI and 3D elements such as the camera) is very minimal and could be improved for mobile devices
- Browser and device compatibility has not been extensively tested

## Sources

- Spruce tree model: https://market.pmnd.rs/model/tree-spruce
- R3f boilerplate: https://github.com/wass08/r3f-vite-starter
