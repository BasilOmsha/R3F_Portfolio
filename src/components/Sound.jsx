import React, { useRef, useEffect } from 'react';
import { useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

function Sound({ url, start }) {
  const { camera } = useThree();
  const sound = useRef();
  const listener = useRef();

  // Load the audio buffer
  const buffer = useLoader(THREE.AudioLoader, url);

  useEffect(() => {
    if (!buffer) return;

    // Create an AudioListener and add it to the camera
    listener.current = new THREE.AudioListener();
    camera.add(listener.current);

    // Create the global audio source
    sound.current = new THREE.Audio(listener.current);
    sound.current.setBuffer(buffer);
    sound.current.setLoop(true);
    sound.current.setVolume(0.5);

    // Play the sound if 'start' is true
    if (start) {
      sound.current.play();
      console.log('Audio started playing');
    }

    return () => {
      // Clean up: stop the sound and remove the listener
      if (sound.current.isPlaying) sound.current.stop();
      camera.remove(listener.current);
      console.log('Audio stopped and listener removed');
    };
  }, [buffer, camera, start]);

  // This component doesn't need to render anything
  return null;
}

export default Sound;