import { Float, OrbitControls, Stars, Text } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

function getTheme(topic = '') {
  const lower = topic.toLowerCase();

  if (/(biology|photosynthesis|plant|nature|cell)/.test(lower)) {
    return {
      core: '#22c55e',
      accent: '#86efac',
      nodes: ['Concept', 'Process', 'Example', 'Quiz'],
    };
  }

  if (/(operating system|computer|coding|algorithm|network)/.test(lower)) {
    return {
      core: '#38bdf8',
      accent: '#a78bfa',
      nodes: ['System', 'Logic', 'Memory', 'Practice'],
    };
  }

  if (/(space|black hole|planet|gravity|astronomy)/.test(lower)) {
    return {
      core: '#f59e0b',
      accent: '#38bdf8',
      nodes: ['Theory', 'Orbit', 'Reality', 'Challenge'],
    };
  }

  return {
    core: '#8b5cf6',
    accent: '#38bdf8',
    nodes: ['Idea', 'Key Point', 'Application', 'Quiz'],
  };
}

function KnowledgeNode({ position, color, label }) {
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
      <group position={position}>
        <mesh>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} />
        </mesh>
        <Text position={[0, -0.95, 0]} fontSize={0.22} color="#e2e8f0">
          {label}
        </Text>
      </group>
    </Float>
  );
}

export function KnowledgeScene({ topic }) {
  const theme = getTheme(topic);
  const title = topic || 'NeuroVerse';

  return (
    <Canvas camera={{ position: [0, 1.5, 8], fov: 52 }}>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.65} />
      <pointLight position={[0, 0, 0]} intensity={30} color={theme.core} />
      <spotLight position={[6, 8, 4]} intensity={20} color={theme.accent} />
      <Stars radius={120} depth={60} count={3500} factor={4} saturation={0} fade speed={0.8} />

      <Float speed={1.5} rotationIntensity={0.35} floatIntensity={0.8}>
        <mesh>
          <octahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial color={theme.core} emissive={theme.core} emissiveIntensity={0.7} wireframe />
        </mesh>
      </Float>

      <Text position={[0, 2.35, 0]} fontSize={0.38} color="#ffffff" maxWidth={6} textAlign="center">
        {title}
      </Text>

      <KnowledgeNode position={[-2.6, 0.6, 0]} color={theme.accent} label={theme.nodes[0]} />
      <KnowledgeNode position={[2.8, 0.5, -0.2]} color={theme.core} label={theme.nodes[1]} />
      <KnowledgeNode position={[-1.9, -1.8, 0.4]} color={theme.core} label={theme.nodes[2]} />
      <KnowledgeNode position={[2.1, -1.7, -0.3]} color={theme.accent} label={theme.nodes[3]} />

      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.6} />
    </Canvas>
  );
}
