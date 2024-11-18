import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import galaxyVertexShader from '../shaders/galaxy/vertex.glsl';
import galaxyFragmentShader from '../shaders/galaxy/fragment.glsl';

function Galaxy(props) {
  const pointsRef = useRef();

  // Galaxy parameters
  const parameters = useMemo(() => ({
    count: 22000,
    size: 2.8,
    radius: 2.65,
    branches: 3,
    spin: 10,
    randomness: 0.15,
    randomnessPower: 3,
    insideColor: 'orange',
    outsideColor: '#0044ff',
    rotationX: 0.225,
    rotationZ: 0.14,
    rotationSpeed: 0.2, // Add rotation speed
  }), []);

  // Generate galaxy geometry
  const galaxyGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const alphas = new Float32Array(parameters.count);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;

      // Position
      const radius = Math.random() * parameters.radius;
      const spinAngle = radius * parameters.spin;
      const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

      const randomX =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;
      const randomY =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;
      const randomZ =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Color
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, radius / parameters.radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      // Alpha
      alphas[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    geometry.computeVertexNormals(); // Compute normals for shader

    return geometry;
  }, []); // Empty dependency array to create it once

  // Create galaxy material using useRef
  const galaxyMaterialRef = useRef();

  if (!galaxyMaterialRef.current) {
    galaxyMaterialRef.current = new THREE.ShaderMaterial({
      vertexShader: galaxyVertexShader,
      fragmentShader: galaxyFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMask: { value: 1 },
      },
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  // Set initial rotation and position
  useEffect(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.reorder('XZY');
      pointsRef.current.rotation.x = parameters.rotationX;
      pointsRef.current.rotation.z = parameters.rotationZ;

      pointsRef.current.position.y = 1.2;
      pointsRef.current.position.z = 1.5;
      
    }
  }, []);

  // Update `uTime` and rotate the galaxy in the frame loop
  useFrame((state, delta) => {
    if (galaxyMaterialRef.current.uniforms.uTime) {
      galaxyMaterialRef.current.uniforms.uTime.value += delta;
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * parameters.rotationSpeed;
    }
  });

  return (
    <points
      ref={pointsRef}
      geometry={galaxyGeometry}
      material={galaxyMaterialRef.current}
      position={props.position}
      rotation={props.rotation}
    />
  );
}

export default Galaxy;
