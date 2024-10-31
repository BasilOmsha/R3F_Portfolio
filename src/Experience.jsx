import { useFrame } from '@react-three/fiber';
import {
  Text,
  Html,
  ContactShadows,
  Float,
  Environment,
  useGLTF,
  OrbitControls,
} from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

// Import your custom shaders
import coffeeSmokeVertexShader from './shaders/vertex.glsl';
import coffeeSmokeFragmentShader from './shaders/fragment.glsl';

export default function Experience() {
  // Load models
  const computer = useGLTF('./Models/laptop.gltf');
  const desk = useGLTF('./Models/desk.gltf');
  const cup = useGLTF('./Models/mug.gltf');

  // References to the cube, camera, raycaster, and smoke
  const cube = useRef();
  const orbitControlsRef = useRef();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const cameraRef = useRef();
  const smoke = useRef();

  // States for dragging
  const [isDragging, setIsDragging] = useState(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // Texture Loader
  const textureLoader = new THREE.TextureLoader();
  const perlinTexture = textureLoader.load('./perlin.png');
  perlinTexture.wrapS = THREE.RepeatWrapping;
  perlinTexture.wrapT = THREE.RepeatWrapping;

  // Create Smoke Geometry, Material, and Mesh
  useEffect(() => {
    // Smoke Geometry
    const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
    smokeGeometry.translate(0, 0.5, 0);
    smokeGeometry.scale(1.5, 6, 1.5);

    // Smoke Material
    const smokeMaterial = new THREE.ShaderMaterial({
      vertexShader: coffeeSmokeVertexShader,
      fragmentShader: coffeeSmokeFragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uPerlinTexture: { value: perlinTexture }
      },
      side: THREE.DoubleSide,
    });

    // Smoke Mesh
    const smokeMesh = new THREE.Mesh(smokeGeometry, smokeMaterial);
    
    smoke.current = smokeMesh;

    // Add the smoke to the scene
    cup.scene.add(smokeMesh);
    smokeMesh.position.set(-0.1, 1.5, -0.2); // Adjust position to be above the mug
    smokeMesh.scale.set(0.8, 0.8, 0.8); // Adjust scale to fit the mug
  }, [cup.scene]);

  // Update cube's rotation and smoke animation every frame
  useFrame((state, delta) => {
    const { camera } = state;
    cameraRef.current = camera; // Update the reference to the camera

    // Apply a small constant rotation when not dragging
    if (!isDragging) {
      cube.current.rotation.y += delta * 0.5;
      cube.current.rotation.x += delta * 0.5;
      cube.current.rotation.z += delta * 0.5;
    }

    if (isDragging) {
      // Calculate delta movement based on mouse movement during drag
      const deltaX = previousMousePosition.current.x - mouse.current.x;
      const deltaY = previousMousePosition.current.y - mouse.current.y;

      // Adjust sensitivity
      const sensitivity = 0.002;

      // Rotate the selected mesh based on mouse movement
      cube.current.rotation.y += deltaX * sensitivity * 0.05;
      cube.current.rotation.x += deltaY * sensitivity * 0.05;

      // Update the previous mouse position
      previousMousePosition.current.x = mouse.current.x;
      previousMousePosition.current.y = mouse.current.y;
    } else {
      // Raycast to check for hover over mesh
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects([cube.current]);

      if (intersects.length > 0) {
        document.body.style.cursor = 'grab';
      } else {
        document.body.style.cursor = 'default';
      }
    }

    // Update smoke animation
    if (smoke.current) {
      smoke.current.material.uniforms.uTime.value += delta;
    }
  });

  // Event handlers for dragging
  const handlePointerDown = (event) => {
    event.stopPropagation();

    // Update raycaster to check for intersections
    raycaster.current.setFromCamera(mouse.current, event.camera);
    const intersects = raycaster.current.intersectObjects([cube.current]);

    if (intersects.length > 0) {
      setIsDragging(true);
      previousMousePosition.current.x = event.clientX;
      previousMousePosition.current.y = event.clientY;

      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = false; // Disable OrbitControls while dragging
      }

      document.body.style.cursor = 'grabbing';
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = true; // Re-enable OrbitControls after dragging
      }

      document.body.style.cursor = 'default';
    }
  };

  const handlePointerMove = (event) => {
    if (isDragging) {
      // Update the current mouse position for dragging
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      previousMousePosition.current.x = event.clientX;
      previousMousePosition.current.y = event.clientY;
    }
  };

  const handleCubePointerMove = (event) => {
    if (!isDragging) {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
  };

  const handleLaptopClick = () => {
    // When the laptop is clicked, zoom in
    if (cameraRef.current) {
      gsap.to(cameraRef.current.position, {
        duration: 1.5,
        x: 0,
        y: 2.5,
        z: 2,
        ease: "power2.inOut",
        onUpdate: () => {
          // Update the controls target to smoothly focus on the laptop
          orbitControlsRef.current.target.set(0, 1.5, -1.4);
          orbitControlsRef.current.update();
        }
      });
    }
  };

  // Add event listeners for pointer up and move globally
  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointermove', handlePointerMove);

    // Cleanup the event listeners on unmount
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [isDragging]);

  return (
    <>
      <Environment preset="city" />

      <color args={['#0a0603']} attach="background" />

      {/* OrbitControls with ref to enable/disable */}
      <OrbitControls ref={orbitControlsRef} makeDefault />

      <rectAreaLight
        width={2.5}
        height={1.65}
        intensity={65}
        color={'#ff6900'}
        rotation={[-0.1, Math.PI, 0]}
        position={[0, 0.55, -1.15]}
      />

      {/* Room Walls */}
      <mesh position={[0, 2.6, -3.3]} scale={[15, 10, 0.5]}>
        <boxGeometry />
        <meshStandardMaterial color={'#354a4f'} /> 
      </mesh>
      <mesh position={[7.8, 2.6, 1.5]} scale={[0.5, 10, 10]}>
        <boxGeometry />
        <meshStandardMaterial color={'#485c55'} /> 
      </mesh>
      <mesh position={[0.3, -2.7, 1.5]} scale={[15.5, 0.5, 10]}>
        <boxGeometry />
        <meshStandardMaterial color={'#5b5855'} /> 
      </mesh>

      {/* Float and Dragging Box */}
      <Float rotationIntensity={0.5}>
        <mesh
          ref={cube}
          position={[-2.5, 1.5, 0]}
          scale={0.3}
          castShadow
          onPointerDown={handlePointerDown}
          onPointerMove={handleCubePointerMove}
          onPointerEnter={() => {
            if (!isDragging) {
              document.body.style.cursor = 'grab';
            }
          }}
          onPointerLeave={() => {
            if (!isDragging) {
              document.body.style.cursor = 'default';
            }
          }}
        >
          <boxGeometry />
          <meshStandardMaterial wireframe={false} color={'#485c55'} />
        </mesh>
      </Float>

      {/* Desk Model */}
      <primitive
        object={desk.scene}
        position={[-0.5, -95, 12.2]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[3, 3, 3]}
        receiveShadow
      />

      {/* Mug Model */}
      <primitive
        object={cup.scene}
        position={[2.2, 0.7, 0.5]}
        rotation={[0, -Math.PI * 0.15, 0]}
        scale={new THREE.Vector3(0.3, 0.3, 0.3)}
        receiveShadow
        castShadow
      />

      {/* Laptop Model with HTML Screen */}
      <primitive
        object={computer.scene}
        position-y={0.4}
        scale={[0.8, 0.8, 0.8]}
        onClick={handleLaptopClick}
        onPointerEnter={() => {
          document.body.style.cursor = 'grab';
        }}
        onPointerLeave={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <Html
          transform
          wrapperClass="htmlScreen"
          distanceFactor={1.17}
          position={[0, 1.56, -1.4]}
          rotation-x={-0.256}
        >
          <iframe src="https://bruno-simon.com/html/" />
        </Html>
      </primitive>

      {/* 3D Text */}
      <Text
        font="./bangers-v20-latin-regular.woff"
        fontSize={1}
        position={[4, 1.75, -2]}
        rotation-y={-0.85}
        maxWidth={2}
      >
        Basil Omsha
      </Text>

      {/* Contact Shadows */}
      <ContactShadows position-y={-2.4} opacity={0.4} scale={10} blur={2.4} />
    </>
  );
}
