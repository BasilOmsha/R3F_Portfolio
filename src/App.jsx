import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Experience from './Experience.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import Sound from './components/Sound.jsx';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Analytics } from "@vercel/analytics/react";

const App = () => {
  const cameraSettings = {
    fov: 45,
    near: 0.1,
    far: 2000,
    position: [-10, 8.5, 18],
  };

  const [start, setStart] = useState(false);

  const handleStart = () => {
    setStart(true);
  };

  return (
    <>
      <Canvas className="r3f" camera={cameraSettings} shadows>
        {/* <fog attach="fog" args={['#16a04b', 12, 30]} /> */}
        {/* Render Sound component only when 'start' is true */}
        {start && (
          <Sound url='/sounds/2019-04-26_-_Tranquility_-_www.fesliyanstudios.com.mp3' start={start} />
        )}
        <Suspense fallback={null}>
          <Experience started={start} />
        </Suspense>
        {/* Uncomment if using postprocessing effects */}
        {/* <EffectComposer>
          <Bloom
            mipmapBlur
            luminanceThreshold={1}
            intensity={1.42}
            radius={0.72}
          />
        </EffectComposer> */}
        <Analytics />
      </Canvas>
      {/* LoadingScreen handles the start of the experience */}
      <LoadingScreen started={start} onStarted={handleStart} />
    </>
  );
};

export default App;