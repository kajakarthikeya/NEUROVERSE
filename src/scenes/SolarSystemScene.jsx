import { OrbitControls, Stars, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const planets = [
  { name: 'Mercury', color: '#f59e0b', size: 0.32, radius: 2.5, speed: 0.018, info: 'Mercury is the closest planet to the Sun.' },
  { name: 'Venus', color: '#f97316', size: 0.42, radius: 3.6, speed: 0.014, info: 'Venus has a thick atmosphere that traps intense heat.' },
  { name: 'Earth', color: '#38bdf8', size: 0.48, radius: 5, speed: 0.011, info: 'Earth supports liquid water and a rich biosphere.' },
  { name: 'Mars', color: '#ef4444', size: 0.4, radius: 6.5, speed: 0.009, info: 'Mars is called the Red Planet because of iron-rich dust.' },
];

function OrbitRing({ radius, highlighted }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.02, radius + 0.02, 128]} />
      <meshBasicMaterial color={highlighted ? '#38bdf8' : '#334155'} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Planet({ planet, onSelect, isSelected }) {
  const group = useRef();
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame(() => {
    angleRef.current += planet.speed;
    const x = Math.cos(angleRef.current) * planet.radius;
    const z = Math.sin(angleRef.current) * planet.radius;
    group.current.position.set(x, 0, z);
    group.current.rotation.y += 0.01;
  });

  return (
    <>
      <OrbitRing radius={planet.radius} highlighted={isSelected} />
      <group ref={group}>
        <mesh onClick={() => onSelect(planet)} scale={isSelected ? 1.2 : 1}>
          <sphereGeometry args={[planet.size, 32, 32]} />
          <meshStandardMaterial color={planet.color} emissive={planet.color} emissiveIntensity={0.2} />
        </mesh>
        <Text position={[0, planet.size + 0.8, 0]} fontSize={0.28} color="#e2e8f0">
          {planet.name}
        </Text>
      </group>
    </>
  );
}

function SolarCore() {
  const sun = useRef();

  useFrame(() => {
    sun.current.rotation.y += 0.005;
  });

  return (
    <mesh ref={sun}>
      <sphereGeometry args={[1.05, 64, 64]} />
      <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={1.2} />
    </mesh>
  );
}

export function SolarSystemScene({ selectedPlanet, onSelectPlanet }) {
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 52 }}>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 0, 0]} intensity={90} color="#fbbf24" />
      <spotLight position={[8, 10, 6]} intensity={18} color="#38bdf8" />
      <Stars radius={140} depth={70} count={5000} factor={4} saturation={0} fade speed={0.8} />
      <SolarCore />
      {planets.map((planet) => (
        <Planet
          key={planet.name}
          planet={planet}
          onSelect={onSelectPlanet}
          isSelected={selectedPlanet?.name === planet.name}
        />
      ))}
      <OrbitControls enablePan={false} minDistance={6} maxDistance={16} />
    </Canvas>
  );
}

export const solarPlanets = planets;
