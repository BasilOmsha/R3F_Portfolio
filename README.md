# Table of Contents
- [Table of Contents](#table-of-contents)
  - [Intro](#intro)
  - [Tech Overview](#tech-overview)
  - [Architecture](#architecture)
  - [Running the application](#running-the-application)
  - [What to expect](#what-to-expect)
  - [Improvements and future features](#improvements-and-future-features)


## Intro
This is a simple but immersive 3D portfolio experience built with React Three Fiber, featuring interactive elements, custom shaders, and responsive design. built in within 24h 

## Tech Overview
 - **React** - Frontend framework with JavaScript
 - **Three.js** - 3D graphics library
 - **React Three Fiber** - React renderer for **Three.js**
 - **React Three Drei** - Useful helpers for R3F
 - GSAP - Animation library
 - **Vite** - Build tool and development server
 - Custom Shaders - **GLSL** for special effects
 - Vercel Analytics - Performance monitoring

## Architecture
  - Scene management through Experience.jsx
  - Modular components for different 3D elements
  - Custom shader implementation
  - Event handling system for user interactions

## Running the application
Simply after cloning the repo or downloading the project, open the terminal and run:

```sh
CD your-project-dir # moves to project directory

npm i # downloads all the necessary packages

npm run dev # Runs the app on localhost
``` 
## What to expect
- Initial loading screen with progress indicator
- Interactive 3D environment with smooth camera controls
- Responsive design that works across devices
- Particle effects and custom visual elements
- Audio 
  
## Improvements and future features
- further seperate logic in the Experience file to smaller components
- Work on shadows
- more interactive elements
- build custome objects with blender

