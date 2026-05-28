'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Float, MeshReflectorMaterial } from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { projects } from '@/data/resume'
import FPSControls from './FPSControls'
import WorldHUD from './WorldHUD'

/* ── Layout: place projects along corridors ── */
const PROJECT_POSITIONS = projects.map((_, i) => {
  const corridor = Math.floor(i / 3)
  const side = i % 2 === 0 ? -1 : 1
  const depth = (i % 3) * 12
  return {
    x: side * 6,
    z: -(corridor * 35 + depth + 10),
    rotation: side > 0 ? -Math.PI / 2 : Math.PI / 2,
  }
})

const WORLD_BOUNDS: [number, number, number, number] = [
  -10, 10, -((Math.ceil(projects.length / 3)) * 35 + 20), 5
]

export default function ProjectsWorld() {
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 0 })
  const [foundProjects, setFoundProjects] = useState<Set<number>>(new Set())

  const handleDiscover = useCallback((index: number) => {
    setFoundProjects(prev => {
      const next = new Set(prev)
      next.add(index)
      return next
    })
  }, [])

  const markers = PROJECT_POSITIONS.map((p, i) => ({
    x: p.x,
    z: p.z,
    found: foundProjects.has(i),
    label: projects[i].title,
  }))

  return (
    <div className="fixed inset-0 z-40">
      <Canvas
        camera={{ position: [0, 1.7, 3], fov: 70, near: 0.1, far: 200 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        shadows
      >
        {/* Ambient */}
        <color attach="background" args={['#020208']} />
        <fog attach="fog" args={['#020208', 5, 60]} />
        <ambientLight intensity={0.05} />

        {/* FPS Controls */}
        <FPSControls
          speed={5}
          sprintMultiplier={2}
          bounds={WORLD_BOUNDS}
          onPositionChange={(p) => setPlayerPos({ x: p.x, z: p.z })}
        />

        {/* Backrooms Environment */}
        <BackroomsEnvironment />

        {/* Project Nodes */}
        {projects.map((project, i) => (
          <ProjectNode
            key={i}
            project={project}
            index={i}
            position={PROJECT_POSITIONS[i]}
            found={foundProjects.has(i)}
            onDiscover={() => handleDiscover(i)}
            playerPos={playerPos}
          />
        ))}

        {/* Floating Particles */}
        <DustParticles />

        {/* Postprocessing */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.3} darkness={0.8} />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={new THREE.Vector2(0.0005, 0.0005)}
            radialModulation={false}
            modulationOffset={0.0}
          />
        </EffectComposer>
      </Canvas>

      <WorldHUD
        worldName="BACKROOMS // PROJECTS"
        accentColor="#ff006e"
        discovered={foundProjects.size}
        total={projects.length}
        itemLabel="PROJECTS"
        position={playerPos}
        markers={markers}
      />
    </div>
  )
}

/* ── Backrooms Corridor Environment ── */
function BackroomsEnvironment() {
  const corridorCount = Math.ceil(projects.length / 3) + 1

  return (
    <group>
      {/* Floor — reflective wet surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -corridorCount * 15]}>
        <planeGeometry args={[24, corridorCount * 40]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={512}
          mixBlur={0.8}
          mixStrength={40}
          roughness={0.5}
          depthScale={1}
          color="#0a0a12"
          metalness={0.6}
          mirror={0.5}
        />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, -corridorCount * 15]}>
        <planeGeometry args={[24, corridorCount * 40]} />
        <meshStandardMaterial color="#060610" roughness={0.9} />
      </mesh>

      {/* Walls */}
      {/* Left wall */}
      <mesh position={[-12, 2, -corridorCount * 15]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[corridorCount * 40, 4]} />
        <meshStandardMaterial color="#080818" roughness={0.8} />
      </mesh>
      {/* Right wall */}
      <mesh position={[12, 2, -corridorCount * 15]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[corridorCount * 40, 4]} />
        <meshStandardMaterial color="#080818" roughness={0.8} />
      </mesh>

      {/* Corridor segment details */}
      {Array.from({ length: corridorCount * 3 }, (_, i) => (
        <CorridorSegment key={i} zPosition={-i * 12} />
      ))}

      {/* Flickering ceiling lights */}
      {Array.from({ length: corridorCount * 4 }, (_, i) => (
        <FlickeringLight key={i} position={[0, 3.8, -i * 10 - 5]} />
      ))}

      {/* Neon accent strips */}
      {Array.from({ length: corridorCount * 2 }, (_, i) => {
        const side = i % 2 === 0 ? -11.9 : 11.9
        return (
          <NeonStrip
            key={i}
            position={[side, 0.5, -i * 15 - 10]}
            color={i % 3 === 0 ? '#ff006e' : i % 3 === 1 ? '#8b5cf6' : '#00f0ff'}
          />
        )
      })}
    </group>
  )
}

/* ── Corridor Segment with pillars ── */
function CorridorSegment({ zPosition }: { zPosition: number }) {
  return (
    <group position={[0, 0, zPosition]}>
      {/* Left pillar */}
      <mesh position={[-11, 2, 0]}>
        <boxGeometry args={[0.3, 4, 0.3]} />
        <meshStandardMaterial color="#0c0c1a" roughness={0.7} />
      </mesh>
      {/* Right pillar */}
      <mesh position={[11, 2, 0]}>
        <boxGeometry args={[0.3, 4, 0.3]} />
        <meshStandardMaterial color="#0c0c1a" roughness={0.7} />
      </mesh>
      {/* Floor groove */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 0.05]} />
        <meshStandardMaterial color="#1a1a2e" emissive="#1a1a2e" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

/* ── Flickering Light ── */
function FlickeringLight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const flickerSpeed = useMemo(() => 2 + Math.random() * 5, [])
  const flickerPhase = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * flickerSpeed + flickerPhase
    const flicker = 0.3 + Math.abs(Math.sin(t) * Math.sin(t * 2.7 + 1)) * 0.7
    const glitch = Math.random() > 0.98 ? 0.1 : 1
    const intensity = flicker * glitch * 1.5

    if (lightRef.current) lightRef.current.intensity = intensity
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = intensity * 2
    }
  })

  return (
    <group position={position}>
      <pointLight ref={lightRef} color="#e8dcc8" intensity={1.5} distance={15} decay={2} />
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 0.05, 0.3]} />
        <meshStandardMaterial color="#333" emissive="#e8dcc8" emissiveIntensity={1} />
      </mesh>
    </group>
  )
}

/* ── Neon accent strip ── */
function NeonStrip({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.05, 0.05, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <pointLight color={color} intensity={0.5} distance={5} decay={2} />
    </group>
  )
}

/* ── Project Node / Holographic Station ── */
function ProjectNode({
  project,
  index,
  position,
  found,
  onDiscover,
  playerPos,
}: {
  project: (typeof projects)[0]
  index: number
  position: { x: number; z: number; rotation: number }
  found: boolean
  onDiscover: () => void
  playerPos: { x: number; z: number }
}) {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const colors = ['#00f0ff', '#8b5cf6', '#ff006e', '#0066ff', '#00ff88']
  const color = colors[index % colors.length]

  useFrame(({ clock }) => {
    if (!groupRef.current) return

    // Check distance to player
    const dx = playerPos.x - position.x
    const dz = playerPos.z - position.z
    const dist = Math.sqrt(dx * dx + dz * dz)

    if (dist < 4 && !found) {
      onDiscover()
    }

    // Pulse glow when nearby
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      const pulse = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.3
      mat.emissiveIntensity = found ? 2 : dist < 8 ? pulse * 3 : pulse
      mat.opacity = found ? 0.4 : dist < 8 ? 0.6 : 0.2
    }
  })

  return (
    <group
      ref={groupRef}
      position={[position.x, 0, position.z]}
      rotation={[0, position.rotation, 0]}
    >
      {/* Ground marker glow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.1}
          toneMapped={false}
        />
      </mesh>

      {/* Glowing pillar */}
      <mesh ref={glowRef} position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 3, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.3}
          toneMapped={false}
        />
      </mesh>

      {/* Light source */}
      <pointLight
        position={[0, 2, 0]}
        color={color}
        intensity={found ? 3 : 1}
        distance={8}
        decay={2}
      />

      {/* Holographic display panel */}
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.3}>
        <group position={[0, 2.2, 0]}>
          {/* Panel background */}
          <mesh>
            <planeGeometry args={[3, 2]} />
            <meshStandardMaterial
              color="#000"
              emissive={color}
              emissiveIntensity={0.05}
              transparent
              opacity={found ? 0.6 : 0.15}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Border */}
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[3.1, 2.1]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>

          {/* Title */}
          <Text
            position={[0, 0.6, 0.01]}
            fontSize={0.15}
            color={color}
            anchorX="center"
            anchorY="middle"
            font="/fonts/orbitron.woff"
            maxWidth={2.6}
          >
            {project.title.toUpperCase()}
          </Text>

          {/* Description */}
          <Text
            position={[0, 0.1, 0.01]}
            fontSize={0.07}
            color="#ffffff80"
            anchorX="center"
            anchorY="top"
            maxWidth={2.6}
            lineHeight={1.4}
          >
            {project.description.slice(0, 120) + (project.description.length > 120 ? '...' : '')}
          </Text>

          {/* Tech stack */}
          <Text
            position={[0, -0.55, 0.01]}
            fontSize={0.06}
            color={`${color}aa`}
            anchorX="center"
            anchorY="middle"
            maxWidth={2.6}
          >
            {project.tech.join(' · ')}
          </Text>

          {/* Status indicator */}
          <Text
            position={[1.2, 0.85, 0.01]}
            fontSize={0.05}
            color={found ? '#00ff88' : '#ffffff40'}
            anchorX="right"
            anchorY="middle"
          >
            {found ? '◆ FOUND' : '◇ UNDISCOVERED'}
          </Text>

          {/* Index number */}
          <Text
            position={[-1.3, 0.85, 0.01]}
            fontSize={0.06}
            color={`${color}60`}
            anchorX="left"
            anchorY="middle"
          >
            {`#${String(index + 1).padStart(2, '0')}`}
          </Text>
        </group>
      </Float>

      {/* Floating diamond marker above */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 3.5, 0]} rotation={[0, Math.PI / 4, Math.PI / 4]}>
          <octahedronGeometry args={[0.15]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={found ? 5 : 2}
            toneMapped={false}
          />
        </mesh>
      </Float>
    </group>
  )
}

/* ── Floating dust particles ── */
function DustParticles() {
  const count = 500
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24
      pos[i * 3 + 1] = Math.random() * 4
      pos[i * 3 + 2] = Math.random() * -200
    }
    return pos
  }, [])

  const ref = useRef<THREE.Points>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const positions = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += Math.sin(clock.getElapsedTime() * 0.5 + i) * 0.001
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#e8dcc8" size={0.03} transparent opacity={0.3} sizeAttenuation />
    </points>
  )
}
