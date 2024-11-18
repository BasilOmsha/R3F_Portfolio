import { useFrame, useLoader } from '@react-three/fiber';
import {
  Text,
  Html,
  ContactShadows,
  Float,
  Environment,
  useGLTF,
  PresentationControls,
  OrbitControls,
} from '@react-three/drei';
import { useRef, useEffect, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import Galaxy from './components/galaxy';

// Import custom shaders
import coffeeSmokeVertexShader from './shaders/vertex.glsl';
import coffeeSmokeFragmentShader from './shaders/fragment.glsl';

export default function Experience({ started }) {
  // **Memoize Model Loading**
  const computer = useGLTF('./Models/laptop.gltf');
  const desk = useGLTF('./Models/desk.gltf');
  const cup = useGLTF('./Models/mug.gltf');
  const book = useGLTF('./Models/book_encyclopedia_set_01_1k.gltf/book_encyclopedia_set_01_1k.gltf');
  const dartboard = useGLTF('./Models/dartboard_1k.gltf/dartboard_1k.gltf');

  console.log('the computer: ', computer.scene);
  console.log('the desk: ', desk.scene);
  console.log('the cup: ', cup.scene);

  // Load the textures
  const [
    texture1,
    texture2,
    texture3,
    texture4,
    texture5,
    texture6,
    texture7,
    texture8,
  ] = useLoader(THREE.TextureLoader, [
    './Materials/textures/wood_floor_deck_diff_1k.jpg',
    './Materials/textures/wood_floor_deck_arm_1k.jpg',
    './Materials/textures/wood_floor_deck_nor_gl_1k.jpg',
    './Materials/textures/wood_floor_deck_disp_1k.jpg',
    './Materials/textures/dirty_carpet_diff_1k.jpg',
    './Materials/textures/dirty_carpet_arm_1k.jpg',
    './Materials/textures/dirty_carpet_nor_gl_1k.jpg',
    './Materials/textures/dirty_carpet_disp_1k.jpg',
  ]);

  texture1.colorSpace = THREE.SRGBColorSpace; // This is needed for color textures

  // **Memoize Texture Loader and Texture**
  const perlinTexture = useMemo(() => {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('./perlin.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  // References
  const cube = useRef();
  const orbitControlsRef = useRef();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const cameraRef = useRef();
  const smoke = useRef();

  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // **Create Smoke Geometry, Material, and Mesh**
  useEffect(() => {
    if (!cup.scene) return; // Ensure the cup model is loaded

    // **Avoid Re-Adding Smoke Mesh**
    if (smoke.current) return;

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
        uPerlinTexture: { value: perlinTexture },
      },
      side: THREE.DoubleSide,
    });

    // Smoke Mesh
    const smokeMesh = new THREE.Mesh(smokeGeometry, smokeMaterial);
    smoke.current = smokeMesh;

    // Add the smoke to the mug scene
    cup.scene.add(smokeMesh);
    smokeMesh.position.set(-0.1, 1.5, -0.2);
    smokeMesh.scale.set(0.9, 0.9, 0.9);

    // **Cleanup Function**
    return () => {
      cup.scene.remove(smokeMesh);
      smoke.current = null; // Reset the smoke ref
    };
  }, [cup.scene, perlinTexture]); // **Dependencies**

  // **Update Frame**
  useFrame((state, delta) => {
    const { camera } = state;
    cameraRef.current = camera;

    if (!isDragging.current) {
      cube.current.rotation.y += delta * 0.5;
      cube.current.rotation.x += delta * 0.5;
      cube.current.rotation.z += delta * 0.5;
    }

    if (isDragging.current) {
      const deltaX = previousMousePosition.current.x - mouse.current.x;
      const deltaY = previousMousePosition.current.y - mouse.current.y;
      const sensitivity = 0.002;

      cube.current.rotation.y += deltaX * sensitivity * 0.05;
      cube.current.rotation.x += deltaY * sensitivity * 0.05;

      previousMousePosition.current.x = mouse.current.x;
      previousMousePosition.current.y = mouse.current.y;
    } else {
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects([cube.current]);

      if (intersects.length > 0) {
        document.body.style.cursor = 'grab';
      } else {
        document.body.style.cursor = 'default';
      }
    }

    if (smoke.current) {
      smoke.current.material.uniforms.uTime.value += delta;
    }
  });

  // **Event Handlers Using Refs**
  const handlePointerDown = useCallback((event) => {
    event.stopPropagation();

    raycaster.current.setFromCamera(mouse.current, event.camera);
    const intersects = raycaster.current.intersectObjects([cube.current]);

    if (intersects.length > 0) {
      isDragging.current = true;
      previousMousePosition.current.x = event.clientX;
      previousMousePosition.current.y = event.clientY;

      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = false;
      }

      document.body.style.cursor = 'grabbing';
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = true;
      }
      document.body.style.cursor = 'default';
    }
  }, []);

  const handlePointerMove = useCallback((event) => {
    if (isDragging.current) {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      previousMousePosition.current.x = event.clientX;
      previousMousePosition.current.y = event.clientY;
    }
  }, []);

  const handleCubePointerMove = useCallback((event) => {
    if (!isDragging.current) {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
  }, []);

  // Handle zooming in on the laptop
  const handleLaptopClick = useCallback(() => {
    if (cameraRef.current) {
      gsap.to(cameraRef.current.position, {
        duration: 1.5,
        x: -1,
        y: 2.6,
        z: 3,
        ease: 'power2.inOut',
        onUpdate: () => {
          orbitControlsRef.current.target.set(0, 1.5, -1.4);
          orbitControlsRef.current.update();
        },
      });
    }
  }, []);

  // **Add Event Listeners Once**
  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [handlePointerUp, handlePointerMove]);

  // **Handle Cursor Changes**
  const handlePointerEnter = useCallback(() => {
    if (!isDragging.current) {
      document.body.style.cursor = 'grab';
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (!isDragging.current) {
      document.body.style.cursor = 'default';
    }
  }, []);

  if (!started) {
    return null;
  }

  return (
    <>
      <Environment preset="city" />

      <color args={['#0a0603']} attach="background" />

      {/* OrbitControls with ref to enable/disable */}
      <OrbitControls
        enableRotate={false}
        enablePan={false}
        ref={orbitControlsRef}
        makeDefault
      />
      <PresentationControls
        global
        rotation={[0.13, 0.2, 0]}
        polar={[-0.4, 0.2]}
        azimuth={[-1, 0.75]}
        // config={{ mass: 2, tension: 400 }}
        // snap={{ mass: 4, tension: 400 }}
        >
        <rectAreaLight
          width={2.5}
          height={1.65}
          intensity={65}
          color={'#69ace9'}
          rotation={[-0.1, Math.PI, 0]}
          position={[0, 0.55, -1.15]}
        />

        {/* Room Walls */}
        <mesh position={[0, 2.6, -3.3]} scale={[15, 10, 0.5]} receiveShadow castShadow>
          <boxGeometry />
          <meshStandardMaterial color={'#354a4f'} />
        </mesh>
        {/* <mesh position={[7.8, 2.6, 1.5]} scale={[0.5, 10, 10]} castShadow>
        <boxGeometry />
        <meshStandardMaterial color={'#485c55'} />
      </mesh> */}
        {/* right wall */}
        <mesh position={[7.8, 5.6, 1.5]} scale={[0.5, 4, 10]}  receiveShadow castShadow>
          <boxGeometry />
          <meshStandardMaterial color={'#485c55'} />
        </mesh>
        <mesh position={[7.8, 2.6, 5.5]} scale={[0.5, 10, 2]}  receiveShadow castShadow>
          <boxGeometry />
          <meshStandardMaterial color={'#485c55'} />
        </mesh>
        <mesh position={[7.8, 2.6, -2.5]} scale={[0.5, 10, 2]}  receiveShadow castShadow>
          <boxGeometry />
          <meshStandardMaterial color={'#485c55'} />
        </mesh>
        <mesh position={[7.8, -1.6, 1.5]} scale={[0.5, 2, 10]}  receiveShadow castShadow>
          <boxGeometry />
          <meshStandardMaterial color={'#485c55'} />
        </mesh>
        {/* right wall end */}
        {/* floor */}
        <mesh position={[0.3, -2.7, 1.5]} scale={[15.5, 0.5, 10]}  receiveShadow castShadow>
          <boxGeometry />
          <meshStandardMaterial
            map={texture1}
            aoMap={texture2}
            roughnessMap={texture2}
            metalnessMap={texture2}
            normalMap={texture3}
            displacementMap={texture4}
            displacementScale={0.1}
            displacementBias={-0.04}
          />
        </mesh>

        <Galaxy position={[10.5, 1.2, 1.4]} rotation={[0, 67.545 * 3, 0]} />

        {/* Shelf */}
        <mesh scale={[6, 0.3, 0.8]} position={[0.1, 5, -2.7]}  receiveShadow castShadow>
          <boxGeometry />
          <meshStandardMaterial color={'#456173'} />
        </mesh>

        {/* Shelf */}
        <mesh
          scale={[6, 0.3, 0.8]}
          rotation={[0, Math.PI / 2, 0]}
          position={[7.2, 5, 1.5]}
          receiveShadow castShadow>
          <boxGeometry />
          <meshStandardMaterial color={'#3a5255'} />
        </mesh>

        {/* books */}
        <primitive
          object={book.scene}
          position={[7.25, 5.15, 0.4]}
          rotation={[0, Math.PI * 1.5, 0]}
          scale={[5, 5, 4]}
          receiveShadow
          castShadow
        />

        {/* Float and Dragging Box */}
        <Float rotationIntensity={0.1}>
          <mesh
            ref={cube}
            position={[0.2, 5.6, -2.6]}
            scale={0.4}
            castShadow
            onPointerDown={handlePointerDown}
            onPointerMove={handleCubePointerMove}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}>
            <boxGeometry />
            <meshStandardMaterial wireframe={true} color={'#e7b21f'} />
          </mesh>
        </Float>

        {/* Desk Model */}
        <primitive
          object={desk.scene}
          position={[-0.5, -95, 12.2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[3, 3, 3]}
          receiveShadow castShadow></primitive>

        {/* Rug */}
        <mesh position={[0.1, -2.4, 0.6]} scale={[10.1, 0.01, 6.2]} castShadow receiveShadow>
          <boxGeometry />
          <meshStandardMaterial
            map={texture5}
            aoMap={texture6}
            roughnessMap={texture6}
            metalnessMap={texture6}
            normalMap={texture7}
            displacementMap={texture8}
            displacementScale={0.1}
            displacementBias={-0.04}
          />
        </mesh>

        {/* dartBoard */}
        <primitive
          object={dartboard.scene}
          position={[-5.5, 3.5, -3]}
          rotation={[0, Math.PI * 4, 0]}
          scale={[4.5, 4.5, 4.5]}
          receiveShadow
          castShadow
        />

        {/* Mug Model */}
        <primitive
          object={cup.scene}
          position={[2.2, 0.7, 0.5]}
          rotation={[0, -Math.PI * 0.15, 0]}
          scale={[0.3, 0.3, 0.3]}
          receiveShadow
          castShadow
        />

        {/* Laptop Model with HTML Screen */}
        <primitive
          object={computer.scene}
          position-y={0.4}
          scale={[0.8, 0.8, 0.8]}
          onClick={handleLaptopClick}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          receiveShadow castShadow>
          <Html
            transform
            wrapperClass="htmlScreen"
            distanceFactor={1.17}
            position={[0, 1.56, -1.4]}
            rotation-x={-0.256}>
            <iframe src="https://portfolio-page-iota-rust.vercel.app/" />
          </Html>
        </primitive>
      </PresentationControls>

      {/* 3D Text */}
      {/* <Text
        font="./bangers-v20-latin-regular.woff"
        fontSize={1}
        position={[4, 1.75, -2]}
        rotation-y={-0.85}
        maxWidth={2}
      >
        Basil Omsha
      </Text> */}

      {/* Contact Shadows */}
      <ContactShadows
        position-y={-2.35}
        // rotation-x={0}
        opacity={0.85}
        scale={10}
        blur={2.4}
      />

      {/* <ContactShadows position-y={3.35} opacity={0.85} scale={10} blur={2.4}  /> */}
    </>
  );
}
