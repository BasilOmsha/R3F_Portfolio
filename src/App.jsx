import Experience from './Experience.jsx';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import LoadingScreen from './components/LoadingScreen.jsx'; 
import Sound from './components/Sound.jsx';
import { Loader} from '@react-three/drei';

// const audio = new Audio('./sound/nightfall-future-bass-music-228100.mp3');

const App = () => {
  const cameraSettings = {
    fov: 45,
    near: 0.1,
    far: 2000,
    position: [-10, 8.5, 18],
  };

  const [start, setStart] = useState(false);

  // useEffect(() => {
  //   if (start) {
  //     audio.play();
  //   }
  // }, [start]);

  const handleStart = () => {
    setStart(true);
    // audio.play();
  };

  return (
    <>
      <Canvas className="r3f" camera={cameraSettings} shadows>
        {/* <fog attach="fog" args={['#16a04b', 12, 30]} /> */}
        {start && <Sound url='./sounds/2019-04-26_-_Tranquility_-_www.fesliyanstudios.com.mp3' />}
        <Suspense fallback={null}>
          <Experience started={start} />
        </Suspense>
        {/* <EffectComposer>
          <Bloom
            mipmapBlur
            luminanceThreshold={1}
            intensity={1.42}
            radius={0.72}
          />
        </EffectComposer> */}
      </Canvas>
      {/* <Loader /> */}
      <LoadingScreen started={start} onStarted={handleStart} />
    </>
  );
};

export default App;
