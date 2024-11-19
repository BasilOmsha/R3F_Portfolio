// Sound.jsx
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

// Forwarding ref to expose playAudio and stopAudio methods
const Sound = forwardRef(({ url }, ref) => {
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
    console.log('AudioListener added to camera');

    // Create the global audio source
    sound.current = new THREE.Audio(listener.current);
    sound.current.setBuffer(buffer);
    sound.current.setLoop(true);
    sound.current.setVolume(0.5);
    console.log('Audio source initialized');

    return () => {
      // Clean up: stop the sound and remove the listener
      if (sound.current.isPlaying) {
        sound.current.stop();
        console.log('Audio stopped');
      }
      camera.remove(listener.current);
      console.log('AudioListener removed from camera');
    };
  }, [buffer, camera]);

  // Expose play and stop methods to the parent component
  useImperativeHandle(ref, () => ({
    playAudio: () => {
      if (sound.current) {
        const audioContext = listener.current.context;
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            console.log('AudioContext resumed');
            sound.current.play();
            console.log('Audio started playing');
          }).catch((error) => {
            console.error('Error resuming AudioContext:', error);
          });
        } else {
          sound.current.play();
          console.log('Audio started playing');
        }
      }
    },
    stopAudio: () => {
      if (sound.current && sound.current.isPlaying) {
        sound.current.stop();
        console.log('Audio stopped');
      }
    }
  }));

  // This component doesn't render anything
  return null;
});

export default Sound;
