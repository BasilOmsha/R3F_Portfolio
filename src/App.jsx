import Experience from './Experience.jsx'
import { Canvas } from '@react-three/fiber'

const App = () => {

	const cameraSettings = {
		fov: 45,
		near: 0.1,
		far: 2000,
		position: [ -10, 8.5, 18 ]
	}

	return (

		<Canvas 
			className="r3f"
			camera={ cameraSettings } 
		>
			<Experience />
		</Canvas>

	)
}

export default App