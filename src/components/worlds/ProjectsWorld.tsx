'use client'

import { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  Vignette,
} from '@react-three/postprocessing'
import * as THREE from 'three'
import { projects } from '@/data/resume'
import FPSControls from './FPSControls'
import WorldHUD from './WorldHUD'

/* ── Layout: stagger projects in rooms along a long corridor ── */
const PROJECT_POSITIONS = projects.map((_, i) => {
  const side = i % 2 === 0 ? -1 : 1
  const z = -(i * 8 + 10)
  return {
    x: side * 4.5,
    z,
    rotation: side > 0 ? -Math.PI / 2 : Math.PI / 2,
  }
})

const CORRIDOR_LENGTH = projects.length * 8 + 30
const WORLD_BOUNDS: [number, number, number, number] = [-7, 7, -CORRIDOR_LENGTH, 5]

/* ── Backrooms Colors ── */
const YELLOW_WALL = '#c4b67c'
const YELLOW_WALL_DARK = '#a89a5e'
const CARPET = '#8b7d5e'
const CARPET_DARK = '#6b5e42'
const CEILING_COLOR = '#d4c89a'
const LIGHT_COLOR = '#fffbe6'

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
        camera={{ position: [0, 1.7, 3], fov: 70, near: 0.1, far: 100 }}
        dpr={[1, 1.25]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        {/* Sickly yellow-brown haze */}
        <color attach="background" args={['#2a2410']} />
        <fog attach="fog" args={['#2a2410', 8, 45]} />

        {/* Dim yellowish ambient */}
        <ambientLight intensity={0.15} color={LIGHT_COLOR} />

        <FPSControls
          speed={4}
          sprintMultiplier={1.6}
          bounds={WORLD_BOUNDS}
          onPositionChange={(p) => setPlayerPos({ x: p.x, z: p.z })}
        />

        {/* Authentic Backrooms Environment */}
        <BackroomsEnvironment />

        {/* Project display stations */}
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

        {/* Dust motes */}
        <DustParticles />

        {/* Postprocessing — minimal for performance */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.4}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.2} darkness={0.6} />
        </EffectComposer>
      </Canvas>

      <WorldHUD
        worldName="BACKROOMS // PROJECTS"
        accentColor="#c4b67c"
        discovered={foundProjects.size}
        total={projects.length}
        itemLabel="PROJECTS"
        position={playerPos}
        markers={markers}
      />
    </div>
  )
}

/* ═════════════════════════════════════════════════
   BACKROOMS ENVIRONMENT
   - Mono-yellow walls, old beige carpet
   - Fluorescent ceiling panel lights
   - Partition walls creating rooms
   ═════════════════════════════════════════════════ */
function BackroomsEnvironment() {
  const segmentCount = Math.ceil(CORRIDOR_LENGTH / 8)

  // Create wall texture with subtle vertical stripe pattern
  const wallTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    // Base yellow
    ctx.fillStyle = '#c4b67c'
    ctx.fillRect(0, 0, 64, 128)
    // Vertical stripes (wallpaper pattern)
    for (let x = 0; x < 64; x += 8) {
      ctx.fillStyle = x % 16 === 0 ? '#b8a96e' : '#ccc088'
      ctx.fillRect(x, 0, 2, 128)
    }
    // Slight staining at bottom
    const grad = ctx.createLinearGradient(0, 80, 0, 128)
    grad.addColorStop(0, 'rgba(100,80,40,0)')
    grad.addColorStop(1, 'rgba(100,80,40,0.3)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 80, 64, 48)

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(4, 1)
    return tex
  }, [])

  // Carpet texture
  const carpetTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = CARPET
    ctx.fillRect(0, 0, 128, 128)
    // Noise for carpet grain
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 128
      const y = Math.random() * 128
      const shade = Math.random() * 30 - 15
      ctx.fillStyle = `rgba(${139 + shade},${125 + shade},${94 + shade},0.5)`
      ctx.fillRect(x, y, 1, 1)
    }
    // Stain spots
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.arc(Math.random() * 128, Math.random() * 128, 3 + Math.random() * 8, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(80,60,30,0.15)'
      ctx.fill()
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(10, CORRIDOR_LENGTH / 4)
    return tex
  }, [])

  // Ceiling texture — simple drop ceiling grid
  const ceilingTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = CEILING_COLOR
    ctx.fillRect(0, 0, 64, 64)
    // Grid lines for drop ceiling tiles
    ctx.strokeStyle = '#b0a878'
    ctx.lineWidth = 1
    ctx.strokeRect(1, 1, 62, 62)
    // Slight variation
    ctx.fillStyle = 'rgba(0,0,0,0.03)'
    ctx.fillRect(0, 0, 32, 32)
    ctx.fillRect(32, 32, 32, 32)
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(8, CORRIDOR_LENGTH / 3)
    return tex
  }, [])

  return (
    <group>
      {/* ── Floor (old moist carpet) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -CORRIDOR_LENGTH / 2]}>
        <planeGeometry args={[16, CORRIDOR_LENGTH]} />
        <meshStandardMaterial map={carpetTexture} roughness={0.95} />
      </mesh>

      {/* ── Ceiling (drop ceiling panels) ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, -CORRIDOR_LENGTH / 2]}>
        <planeGeometry args={[16, CORRIDOR_LENGTH]} />
        <meshStandardMaterial map={ceilingTexture} roughness={0.85} />
      </mesh>

      {/* ── Main corridor walls ── */}
      {/* Left */}
      <mesh position={[-8, 1.6, -CORRIDOR_LENGTH / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[CORRIDOR_LENGTH, 3.2]} />
        <meshStandardMaterial map={wallTexture} roughness={0.8} />
      </mesh>
      {/* Right */}
      <mesh position={[8, 1.6, -CORRIDOR_LENGTH / 2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[CORRIDOR_LENGTH, 3.2]} />
        <meshStandardMaterial map={wallTexture} roughness={0.8} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 1.6, 5]}>
        <planeGeometry args={[16, 3.2]} />
        <meshStandardMaterial map={wallTexture} roughness={0.8} />
      </mesh>

      {/* ── Partition walls creating room segments ── */}
      {Array.from({ length: segmentCount }, (_, i) => (
        <RoomPartition key={i} z={-i * 8 - 4} wallTexture={wallTexture} side={i % 2 === 0 ? 1 : -1} />
      ))}

      {/* ── Fluorescent ceiling lights ── */}
      {Array.from({ length: Math.floor(CORRIDOR_LENGTH / 6) }, (_, i) => (
        <FluorescentLight key={i} position={[0, 3.15, -i * 6 - 3]} index={i} />
      ))}
    </group>
  )
}

/* ── Room partition wall (creates that classic segmented room feel) ── */
function RoomPartition({ z, wallTexture, side }: { z: number; wallTexture: THREE.Texture; side: number }) {
  return (
    <group position={[0, 0, z]}>
      {/* Partition wall from one side, not reaching the other — creates openings */}
      <mesh position={[side * 4, 1.6, 0]}>
        <boxGeometry args={[8, 3.2, 0.15]} />
        <meshStandardMaterial map={wallTexture} roughness={0.8} />
      </mesh>
      {/* Short perpendicular wall creating an alcove */}
      <mesh position={[side * 0.07, 1.6, side * 2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[4, 3.2, 0.15]} />
        <meshStandardMaterial map={wallTexture} roughness={0.8} />
      </mesh>
    </group>
  )
}

/* ── Fluorescent ceiling light panel (the iconic buzzing light) ── */
function FluorescentLight({ position, index }: { position: [number, number, number]; index: number }) {
  const lightRef = useRef<THREE.PointLight>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const flickerData = useMemo(() => ({
    speed: 3 + Math.random() * 4,
    phase: Math.random() * Math.PI * 2,
    broken: Math.random() < 0.12, // 12% chance to be broken/off
    dim: Math.random() < 0.2, // 20% chance to be dim/dying
  }), [])

  useFrame(({ clock }) => {
    if (flickerData.broken) return
    const t = clock.getElapsedTime() * flickerData.speed + flickerData.phase
    let intensity: number
    if (flickerData.dim) {
      // Dying light — heavy flicker
      intensity = 0.2 + Math.abs(Math.sin(t * 3)) * 0.3
      if (Math.random() > 0.95) intensity = 0.05 // random dropout
    } else {
      // Normal light with subtle flicker
      intensity = 0.8 + Math.sin(t) * 0.1
      if (Math.random() > 0.995) intensity = 0.3 // rare glitch
    }
    if (lightRef.current) lightRef.current.intensity = intensity * 2
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = intensity * 1.5
    }
  })

  if (flickerData.broken) {
    // Dead light — just the fixture, no glow
    return (
      <mesh position={position}>
        <boxGeometry args={[1.2, 0.04, 0.3]} />
        <meshStandardMaterial color="#888" roughness={0.9} />
      </mesh>
    )
  }

  return (
    <group position={position}>
      <pointLight
        ref={lightRef}
        color={LIGHT_COLOR}
        intensity={flickerData.dim ? 0.5 : 1.5}
        distance={10}
        decay={2}
      />
      {/* Light fixture panel */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1.2, 0.04, 0.3]} />
        <meshStandardMaterial
          color="#eee"
          emissive={LIGHT_COLOR}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

/* ═════════════════════════════════════════════════
   PROJECT NODE — Display with video playback
   ═════════════════════════════════════════════════ */
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
  const colors = ['#00f0ff', '#8b5cf6', '#ff006e', '#0066ff', '#00ff88']
  const color = colors[index % colors.length]
  const [isNear, setIsNear] = useState(false)

  useFrame(() => {
    const dx = playerPos.x - position.x
    const dz = playerPos.z - position.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const near = dist < 6
    setIsNear(near)
    if (dist < 4 && !found) onDiscover()
  })

  return (
    <group
      ref={groupRef}
      position={[position.x, 0, position.z]}
      rotation={[0, position.rotation, 0]}
    >
      {/* Holographic display — stands out against yellow walls */}
      <group position={[0, 1.8, 0]}>
        {/* Dark panel background */}
        <mesh>
          <planeGeometry args={[2.8, 1.8]} />
          <meshStandardMaterial
            color="#0a0a15"
            emissive={color}
            emissiveIntensity={found ? 0.08 : 0.02}
            transparent
            opacity={isNear ? 0.85 : 0.5}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Border glow */}
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[2.9, 1.9]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isNear ? 1.5 : 0.5}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* Video screen area (top half) */}
        {project.video && (
          <VideoScreen
            videoSrc={project.video}
            position={[0, 0.25, 0.01]}
            size={[2.4, 0.9]}
            isNear={isNear}
          />
        )}

        {/* Title */}
        <Text
          position={[0, project.video ? -0.4 : 0.5, 0.01]}
          fontSize={0.12}
          color={color}
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron.woff"
          maxWidth={2.4}
        >
          {project.title.toUpperCase()}
        </Text>

        {/* Description (shortened) */}
        <Text
          position={[0, project.video ? -0.6 : 0, 0.01]}
          fontSize={0.055}
          color="#ffffff70"
          anchorX="center"
          anchorY="top"
          maxWidth={2.4}
          lineHeight={1.3}
        >
          {project.description.slice(0, 100) + (project.description.length > 100 ? '...' : '')}
        </Text>

        {/* Tech stack */}
        <Text
          position={[0, -0.8, 0.01]}
          fontSize={0.045}
          color={`${color}99`}
          anchorX="center"
          anchorY="middle"
          maxWidth={2.4}
        >
          {project.tech.slice(0, 5).join(' · ')}
        </Text>

        {/* Status */}
        <Text
          position={[1.2, 0.82, 0.01]}
          fontSize={0.04}
          color={found ? '#00ff88' : '#ffffff30'}
          anchorX="right"
          anchorY="middle"
        >
          {found ? '◆ FOUND' : '◇ ---'}
        </Text>

        {/* Index */}
        <Text
          position={[-1.2, 0.82, 0.01]}
          fontSize={0.05}
          color={`${color}50`}
          anchorX="left"
          anchorY="middle"
        >
          {`#${String(index + 1).padStart(2, '0')}`}
        </Text>
      </group>

      {/* Small accent light on floor beneath display */}
      <pointLight
        position={[0, 0.5, 0]}
        color={color}
        intensity={isNear ? 1.5 : 0.3}
        distance={5}
        decay={2}
      />
    </group>
  )
}

/* ── Video screen using HTML video → CanvasTexture ── */
function VideoScreen({
  videoSrc,
  position,
  size,
  isNear,
}: {
  videoSrc: string
  position: [number, number, number]
  size: [number, number]
  isNear: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const textureRef = useRef<THREE.VideoTexture | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = document.createElement('video')
    video.src = videoSrc
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.preload = 'metadata'
    videoRef.current = video

    const tex = new THREE.VideoTexture(video)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.colorSpace = THREE.SRGBColorSpace
    textureRef.current = tex

    return () => {
      video.pause()
      video.src = ''
      tex.dispose()
    }
  }, [videoSrc])

  // Play/pause based on proximity
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isNear) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [isNear])

  useFrame(() => {
    if (textureRef.current && videoRef.current && !videoRef.current.paused) {
      textureRef.current.needsUpdate = true
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={textureRef.current}
        toneMapped={false}
        transparent
        opacity={isNear ? 1 : 0.3}
      />
    </mesh>
  )
}

/* ── Dust particles (lightweight) ── */
function DustParticles() {
  const count = 200 // reduced from 500
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16
      pos[i * 3 + 1] = Math.random() * 3
      pos[i * 3 + 2] = Math.random() * -CORRIDOR_LENGTH
    }
    return pos
  }, [])

  // No per-frame animation — static dust is fine and saves CPU

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#d4c89a" size={0.02} transparent opacity={0.25} sizeAttenuation />
    </points>
  )
}
