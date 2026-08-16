import React, { useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

let Canvas, useFrame;
let r3fLoaded = false;

try {
  const r3f = require('@react-three/fiber');
  Canvas = r3f.Canvas;
  useFrame = r3f.useFrame;
  r3fLoaded = true;
} catch (e) {
  r3fLoaded = false;
}

class WidgetCanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn('3D Widget Canvas Notice:', error?.message);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}


function SingleDumbbell() {
  const ref = useRef();
  if (useFrame) {
    useFrame((state, delta) => {
      if (ref.current) {
        ref.current.rotation.x += delta * 0.5;
        ref.current.rotation.y += delta * 0.8;
      }
    });
  }
  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
        <meshStandardMaterial color="#888899" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.15, 6]} />
        <meshStandardMaterial color="#FF5722" metalness={0.8} roughness={0.2} emissive="#FF5722" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.15, 6]} />
        <meshStandardMaterial color="#FF5722" metalness={0.8} roughness={0.2} emissive="#FF5722" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function SingleShaker() {
  const ref = useRef();
  if (useFrame) {
    useFrame((state, delta) => {
      if (ref.current) {
        ref.current.rotation.y += delta * 0.6;
        ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      }
    });
  }
  return (
    <group ref={ref}>
      {/* Bottle Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 0.8, 24]} />
        <meshStandardMaterial color="#34C759" transparent opacity={0.85} roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Screw Cap */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.12, 24]} />
        <meshStandardMaterial color="#1C1C1E" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Spout Cap */}
      <mesh position={[0.08, 0.54, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.08, 12]} />
        <meshStandardMaterial color="#FF5722" emissive="#FF5722" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function SingleTrophy() {
  const ref = useRef();
  if (useFrame) {
    useFrame((state, delta) => {
      if (ref.current) {
        ref.current.rotation.y += delta * 0.7;
      }
    });
  }
  return (
    <group ref={ref}>
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[0.3, 0.12, 0.3]} />
        <meshStandardMaterial color="#222" metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.28, 0.08, 0.3, 24]} />
        <meshStandardMaterial color="#FFD700" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

function SingleAIOrb() {
  const orbRef = useRef();
  const ringRef = useRef();

  if (useFrame) {
    useFrame((state, delta) => {
      const t = state.clock.elapsedTime;
      if (orbRef.current) {
        orbRef.current.rotation.y += delta * 0.8;
        orbRef.current.rotation.x = Math.sin(t) * 0.2;
      }
      if (ringRef.current) {
        ringRef.current.rotation.z = t * 1.2;
        ringRef.current.rotation.y = t * 0.6;
      }
    });
  }

  return (
    <group>
      <mesh ref={orbRef}>
        <icosahedronGeometry args={[0.5, 2]} />
        <meshStandardMaterial
          color="#0EA5E9"
          emissive="#38BDF8"
          emissiveIntensity={1.2}
          wireframe
        />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.8, 0.03, 16, 48]} />
        <meshStandardMaterial color="#FF5722" emissive="#FF5722" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function WidgetScene({ type }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 4]} intensity={1.5} color="#FFFFFF" />
      <pointLight position={[-2, -2, 2]} intensity={1.5} color="#FF5722" />

      {type === 'dumbbell' && <SingleDumbbell />}
      {type === 'shaker' && <SingleShaker />}
      {type === 'trophy' && <SingleTrophy />}
      {type === 'ai_orb' && <SingleAIOrb />}
    </>
  );
}

export default function BurnX3DFitnessWidget({ type = 'dumbbell', width = 100, height = 100 }) {
  const fallbackUI = <View style={[styles.fallback, { width, height }]} />;

  if (Platform.OS !== 'web' || !r3fLoaded) {
    return fallbackUI;
  }

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <WidgetCanvasErrorBoundary fallback={fallbackUI}>
        <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }} style={{ width: '100%', height: '100%' }}>
          <WidgetScene type={type} />
        </Canvas>
      </WidgetCanvasErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: 'rgba(255,87,34,0.1)',
    borderRadius: 16,
  },
});
