'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

// ─── Candle Field ─────────────────────────────────────────────────
interface CandleData {
  x: number;
  y: number;
  z: number;
  h: number;
  bull: boolean;
  seed: number;
}

function CandleField() {
  const group = useRef<THREE.Group>(null);
  const candles = useMemo<CandleData[]>(() => {
    return Array.from({ length: 80 }, () => ({
      x: (Math.random() - 0.5) * 24,
      y: (Math.random() - 0.5) * 12,
      z: -Math.random() * 14,
      h: 0.4 + Math.random() * 1.8,
      bull: Math.random() > 0.45,
      seed: Math.random() * 10,
    }));
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.08) * 0.08;
    group.current.children.forEach((c, i) => {
      const candle = candles[i];
      if (!candle) return;
      c.position.y = candle.y + Math.sin(t * 0.6 + candle.seed) * 0.2;
      const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = 0.6 + Math.sin(t * 1.2 + candle.seed) * 0.4;
    });
  });

  return (
    <group ref={group}>
      {candles.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]}>
          <boxGeometry args={[0.12, c.h, 0.12]} />
          <meshStandardMaterial
            color={c.bull ? '#00FFB2' : '#FF5470'}
            emissive={c.bull ? '#00FFB2' : '#FF5470'}
            emissiveIntensity={0.8}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Signal Network (particle field) ─────────────────────────────
function SignalNetwork() {
  const points = useRef<THREE.Points>(null);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = -Math.random() * 20;
    }
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  useFrame((s) => {
    if (points.current) points.current.rotation.y = s.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={points} geometry={geom}>
      <pointsMaterial size={0.04} color="#3D8EFF" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

// ─── Holographic Chart Line ────────────────────────────────────────
function HoloChart() {
  const ref = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
      const x = -6 + (i / 60) * 12;
      const y = Math.sin(i * 0.3) * 0.6 + Math.cos(i * 0.15) * 0.4 + i * 0.04;
      pts.push(new THREE.Vector3(x, y - 1, 0));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 200, 0.04, 8, false);
  }, []);

  useFrame((s) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <Float speed={1.2} floatIntensity={0.4} rotationIntensity={0.15}>
      <mesh ref={ref} geometry={geom} position={[0, 0, -2]}>
        <meshStandardMaterial
          color="#00FFB2"
          emissive="#00FFB2"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
    </Float>
  );
}

// ─── Main Export ──────────────────────────────────────────────────
export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 8], fov: 55 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#02050C']} />
      <fog attach="fog" args={['#02050C', 8, 22]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[6, 4, 4]} intensity={1.2} color="#3D8EFF" />
      <pointLight position={[-6, -4, 2]} intensity={0.8} color="#00FFB2" />
      <SignalNetwork />
      <CandleField />
      <HoloChart />
    </Canvas>
  );
}
