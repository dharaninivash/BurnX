import React, { useRef, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { useTheme } from '../../theme/theme';

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

class ThreeCanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn('BurnX 3D Scene Notice:', error?.message);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}


// --- Dynamic Mouse Parallax & Interactive 3D Objects ---

function MouseParallaxGroup({ children }) {
  const groupRef = useRef();

  if (useFrame) {
    useFrame((state) => {
      if (groupRef.current) {
        // Smoothly interpolate camera tilt based on pointer position
        const targetX = (state.pointer.x * Math.PI) / 8;
        const targetY = (state.pointer.y * Math.PI) / 8;
        
        groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.05;
        groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * 0.05;
      }
    });
  }

  return <group ref={groupRef}>{children}</group>;
}

function WeightPlateModel({ position = [0, 0, 0], scale = 1, color = "#FF5722", isDark = true }) {
  const meshRef = useRef();

  if (useFrame) {
    useFrame((state, delta) => {
      if (meshRef.current) {
        meshRef.current.rotation.x += delta * 0.5;
        meshRef.current.rotation.z += delta * 0.3;
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.4 + position[0]) * 0.18;
      }
    });
  }

  return (
    <group ref={meshRef} position={position} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.45, 0.45, 0.08, 32]} />
        <meshStandardMaterial color={isDark ? "#141418" : "#3A3A48"} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Inner Rim Accent */}
      <mesh position={[0, 0.045, 0]}>
        <torusGeometry args={[0.3, 0.03, 16, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, -0.045, 0]}>
        <torusGeometry args={[0.3, 0.03, 16, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function EnergyShockwaveRing({ position = [0, 0, 0] }) {
  const ringRef = useRef();

  if (useFrame) {
    useFrame((state) => {
      if (ringRef.current) {
        const t = (state.clock.elapsedTime * 0.8) % 2;
        ringRef.current.scale.set(1 + t * 1.2, 1 + t * 1.2, 1 + t * 1.2);
        ringRef.current.material.opacity = Math.max(0, 1 - t / 2);
      }
    });
  }

  return (
    <mesh ref={ringRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.2, 1.25, 64]} />
      <meshBasicMaterial color="#FF5722" transparent opacity={0.6} depthWrite={false} />
    </mesh>
  );
}

function DumbbellModel({ position = [0, 0, 0], scale = 1, isDark = true }) {
  const meshRef = useRef();

  if (useFrame) {
    useFrame((state, delta) => {
      if (meshRef.current) {
        meshRef.current.rotation.x += delta * 0.5;
        meshRef.current.rotation.y += delta * 0.7;
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.15;
      }
    });
  }

  return (
    <group ref={meshRef} position={position} scale={scale}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
        <meshStandardMaterial color={isDark ? "#A0A0B5" : "#606075"} metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.15, 6]} />
        <meshStandardMaterial color={isDark ? "#16161A" : "#303040"} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[-0.38, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.1, 6]} />
        <meshStandardMaterial color="#FF5722" metalness={0.7} roughness={0.2} emissive="#FF5722" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.38, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.1, 6]} />
        <meshStandardMaterial color="#FF5722" metalness={0.7} roughness={0.2} emissive="#FF5722" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.15, 6]} />
        <meshStandardMaterial color={isDark ? "#16161A" : "#303040"} metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
}

function KettlebellModel({ position = [0, 0, 0], scale = 1, isDark = true }) {
  const groupRef = useRef();

  if (useFrame) {
    useFrame((state, delta) => {
      if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.6;
        groupRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * 1.8 + position[0]) * 0.14;
      }
    });
  }

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color={isDark ? "#111116" : "#2E2E3A"} metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 16]} />
        <meshStandardMaterial color="#0EA5E9" metalness={0.8} roughness={0.2} emissive="#0EA5E9" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <torusGeometry args={[0.25, 0.06, 16, 32, Math.PI]} />
        <meshStandardMaterial color={isDark ? "#555566" : "#444455"} metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

function BurnXLogoEmblem({ position = [0, 0, 0], scale = 1, isDark = true }) {
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  if (useFrame) {
    useFrame((state, delta) => {
      const t = state.clock.elapsedTime;
      if (coreRef.current) {
        coreRef.current.rotation.y += delta * 1.0;
        coreRef.current.rotation.x = Math.sin(t * 0.8) * 0.3;
        coreRef.current.position.y = position[1] + Math.sin(t * 1.4) * 0.12;
      }
      if (ring1Ref.current) {
        ring1Ref.current.rotation.x = t * 0.8;
        ring1Ref.current.rotation.z = t * 0.4;
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.y = -t * 0.9;
        ring2Ref.current.rotation.z = t * 0.5;
      }
      if (ring3Ref.current) {
        ring3Ref.current.rotation.x = -t * 0.6;
        ring3Ref.current.rotation.y = t * 0.7;
      }
    });
  }

  return (
    <group position={position} scale={scale}>
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.75, 0]} />
        <meshStandardMaterial
          color="#FF5722"
          emissive="#FF7043"
          emissiveIntensity={1.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.15, 0.045, 16, 64]} />
        <meshStandardMaterial color={isDark ? "#FFFFFF" : "#1E1E24"} metalness={0.95} roughness={0.05} />
      </mesh>

      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.4, 0.035, 16, 64]} />
        <meshStandardMaterial color="#FF5722" metalness={0.9} roughness={0.1} emissive="#FF3D00" emissiveIntensity={0.7} />
      </mesh>

      <mesh ref={ring3Ref}>
        <torusGeometry args={[1.65, 0.025, 16, 64]} />
        <meshStandardMaterial color="#0EA5E9" metalness={0.9} roughness={0.1} emissive="#0EA5E9" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function SmartWatchModel({ position = [0, 0, 0], scale = 1, isDark = true }) {
  const watchRef = useRef();

  if (useFrame) {
    useFrame((state, delta) => {
      if (watchRef.current) {
        watchRef.current.rotation.y += delta * 0.5;
        watchRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.12;
        watchRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.6 + 1) * 0.14;
      }
    });
  }

  return (
    <group ref={watchRef} position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[0.5, 0.6, 0.12]} />
        <meshStandardMaterial color={isDark ? "#1C1C1E" : "#2E2E38"} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[0.42, 0.52, 0.02]} />
        <meshStandardMaterial color="#0A0A0F" emissive="#0EA5E9" emissiveIntensity={0.8} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <ringGeometry args={[0.12, 0.15, 32]} />
        <meshStandardMaterial color="#34C759" emissive="#34C759" emissiveIntensity={1.8} />
      </mesh>
    </group>
  );
}

function TrophyModel({ position = [0, 0, 0], scale = 1, isDark = true }) {
  const trophyRef = useRef();

  if (useFrame) {
    useFrame((state, delta) => {
      if (trophyRef.current) {
        trophyRef.current.rotation.y += delta * 0.6;
        trophyRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * 1.4 + 2) * 0.12;
      }
    });
  }

  return (
    <group ref={trophyRef} position={position} scale={scale}>
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[0.35, 0.15, 0.35]} />
        <meshStandardMaterial color={isDark ? "#1E1E24" : "#383848"} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.35, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.3, 0.1, 0.35, 32]} />
        <meshStandardMaterial color="#FFD700" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <octahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial color="#FF5722" emissive="#FF9800" emissiveIntensity={1.8} />
      </mesh>
    </group>
  );
}

function ParticleField({ count = 200 }) {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const choice = Math.random();
      if (choice > 0.6) {
        col[i * 3] = 1.0; // Orange
        col[i * 3 + 1] = 0.34;
        col[i * 3 + 2] = 0.13;
      } else if (choice > 0.3) {
        col[i * 3] = 0.05; // Cyan
        col[i * 3 + 1] = 0.65;
        col[i * 3 + 2] = 0.91;
      } else {
        col[i * 3] = 1.0; // Gold
        col[i * 3 + 1] = 0.84;
        col[i * 3 + 2] = 0.0;
      }
    }
    return [pos, col];
  }, [count]);

  if (useFrame) {
    useFrame((state, delta) => {
      if (pointsRef.current) {
        pointsRef.current.rotation.y += delta * 0.06;
        pointsRef.current.rotation.x += delta * 0.03;
      }
    });
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function MainSceneContent({ isDark }) {
  return (
    <MouseParallaxGroup>
      <ambientLight intensity={isDark ? 0.9 : 1.7} />
      <directionalLight position={[6, 10, 6]} intensity={isDark ? 1.8 : 2.2} color="#FFFFFF" castShadow />
      <pointLight position={[-5, -3, -2]} intensity={2.5} color="#FF5722" />
      <pointLight position={[5, 4, 3]} intensity={2.0} color="#0EA5E9" />
      <pointLight position={[0, -4, 2]} intensity={1.5} color="#FFD700" />

      {/* Main Center BurnX Emblem */}
      <BurnXLogoEmblem position={[0, 0.2, 0]} scale={1.35} isDark={isDark} />

      {/* Energy Shockwave Ring */}
      <EnergyShockwaveRing position={[0, -0.4, 0]} />

      {/* Floating 3D Fitness Artifacts */}
      <DumbbellModel position={[-2.6, 0.9, -0.4]} scale={0.85} isDark={isDark} />
      <KettlebellModel position={[2.6, -0.6, -0.2]} scale={0.85} isDark={isDark} />
      <SmartWatchModel position={[-2.2, -1.1, 0.6]} scale={0.9} isDark={isDark} />
      <TrophyModel position={[2.2, 1.1, -0.8]} scale={0.85} isDark={isDark} />

      {/* Hovering Weight Plates */}
      <WeightPlateModel position={[-1.2, 1.8, -1.2]} scale={0.7} color="#FF5722" isDark={isDark} />
      <WeightPlateModel position={[1.4, -1.6, -1.0]} scale={0.7} color="#0EA5E9" isDark={isDark} />

      {/* Dense Particle Swarm */}
      <ParticleField count={220} />
    </MouseParallaxGroup>
  );
}

export default function BurnX3DHeroScene({ height = 400 }) {
  const { colors, isDark } = useTheme();

  const fallbackUI = (
    <View style={[styles.fallbackContainer, { height, backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.glowCircle} />
    </View>
  );

  if (Platform.OS !== 'web' || !r3fLoaded) {
    return fallbackUI;
  }

  return (
    <View style={[styles.container, { height, backgroundColor: isDark ? 'rgba(10, 10, 15, 0.85)' : 'rgba(255, 255, 255, 0.9)', borderColor: colors.border }]}>
      <ThreeCanvasErrorBoundary fallback={fallbackUI}>
        <Canvas
          camera={{ position: [0, 0, 5.8], fov: 48 }}
          style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
          gl={{ antialias: true, alpha: true }}
        >
          <MainSceneContent isDark={isDark} />
        </Canvas>
      </ThreeCanvasErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
  },
  fallbackContainer: {
    width: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  glowCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 87, 34, 0.25)',
    borderWidth: 2,
    borderColor: '#FF5722',
  },
});
