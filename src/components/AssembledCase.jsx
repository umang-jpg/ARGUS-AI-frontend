import { useGLTF } from '@react-three/drei';

export default function AssembledCase() {
  const { scene } = useGLTF('/assembled_case.glb');

  return <primitive object={scene} scale={0.1} />;
}