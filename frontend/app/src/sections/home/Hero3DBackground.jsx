import { Canvas } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Environment } from '@react-three/drei';

function LiquidSilk() {
  return (
    // Float adds a slow, elegant hovering animation
    <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2}>
      {/* Sphere with high segment count for smooth distortion */}
      <Sphere args={[1, 100, 100]} scale={2.4}>
        {/* MeshDistortMaterial creates the fluid, trendy fashion aesthetic */}
        <MeshDistortMaterial
          color="#d4af37" // Soft gold/rose-gold tone. Can be changed to #ffffff for pure pearl.
          attach="material"
          distort={0.4}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

export default function Hero3DBackground() {
  return (
    <div className="absolute inset-0 z-0 opacity-80">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        {/* Environment adds realistic lighting reflections to the metalness */}
        <Environment preset="city" />
        <LiquidSilk />
      </Canvas>
    </div>
  );
}