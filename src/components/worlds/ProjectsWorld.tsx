'use client'

import { useRef, useMemo, useState, useCallback, useEffect, createContext, useContext } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { projects } from '@/data/resume'
import FPSControls, { type WallBox } from './FPSControls'
import WorldHUD from './WorldHUD'
import MobileJoystick from './MobileJoystick'

/* ── Shared player position via ref (never causes re-renders) ── */
const PlayerPosContext = createContext<React.MutableRefObject<{ x: number; z: number }>>({ current: { x: 0, z: 0 } } as any)

/* ── Layout ── */
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

const LIGHT_COLOR = '#fffbe6'
const CARPET = '#8b7d5e'
const CEILING_COLOR = '#d4c89a'

const WALL_THICKNESS = 0.15
const DOORWAY_WIDTH = 2.2

/* ── Build wall AABB list for collision ── */
function buildWalls(): WallBox[] {
  const walls: WallBox[] = []
  const half = WALL_THICKNESS / 2

  // Outer walls
  walls.push([-8 - half, -8 + half, -CORRIDOR_LENGTH, 5])  // left
  walls.push([8 - half, 8 + half, -CORRIDOR_LENGTH, 5])     // right
  walls.push([-8, 8, 5 - half, 5 + half])                    // back

  // Partition walls with doorway gaps
  const segmentCount = Math.ceil(CORRIDOR_LENGTH / 8)
  for (let i = 0; i < segmentCount; i++) {
    const z = -i * 8 - 4
    const side = i % 2 === 0 ? 1 : -1

    // Horizontal partition: extends from side*0 to side*8, centered at side*4
    // But has a doorway gap near center (around x=0)
    const wallCenter = side * 4
    const wallHalfLen = 4  // total 8 units long
    const wallMinX = wallCenter - wallHalfLen
    const wallMaxX = wallCenter + wallHalfLen

    // Create doorway gap: opening near the corridor center
    const doorCenter = side > 0 ? wallMinX + 1 : wallMaxX - 1  // gap near x=0
    const doorHalf = DOORWAY_WIDTH / 2

    // Left part of horizontal wall (before door)
    if (doorCenter - doorHalf > wallMinX) {
      walls.push([wallMinX, doorCenter - doorHalf, z - half, z + half])
    }
    // Right part of horizontal wall (after door)
    if (doorCenter + doorHalf < wallMaxX) {
      walls.push([doorCenter + doorHalf, wallMaxX, z - half, z + half])
    }

    // Vertical partition wall along center
    const vz1 = z + side * 0
    const vz2 = z + side * 2
    const vzMin = Math.min(vz1, vz2)
    const vzMax = Math.max(vz1, vz2)
    walls.push([-half + side * 0.07, half + side * 0.07, vzMin, vzMax])
  }

  return walls
}

const WALL_BOXES = buildWalls()

export default function ProjectsWorld() {
  const playerPosRef = useRef({ x: 0, z: 0 })
  const [hudPos, setHudPos] = useState({ x: 0, z: 0 })
  const [foundProjects, setFoundProjects] = useState<Set<number>>(new Set())
  const hudUpdateRef = useRef(0)
  const joystickRef = useRef({ mx: 0, mz: 0, cx: 0, cy: 0 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const handleDiscover = useCallback((index: number) => {
    setFoundProjects(prev => {
      if (prev.has(index)) return prev
      const next = new Set(prev)
      next.add(index)
      return next
    })
  }, [])

  const handlePositionChange = useCallback((pos: THREE.Vector3) => {
    playerPosRef.current.x = pos.x
    playerPosRef.current.z = pos.z
    const now = Date.now()
    if (now - hudUpdateRef.current > 200) {
      hudUpdateRef.current = now
      setHudPos({ x: pos.x, z: pos.z })
    }
  }, [])

  const markers = useMemo(() => PROJECT_POSITIONS.map((p, i) => ({
    x: p.x,
    z: p.z,
    found: foundProjects.has(i),
    label: projects[i].title,
  })), [foundProjects])

  return (
    <div className="fixed inset-0 z-40">
      <Canvas
        camera={{ position: [0, 1.7, 3], fov: 70, near: 0.1, far: 80 }}
        dpr={[1, 1]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        frameloop="always"
      >
        <color attach="background" args={['#2a2410']} />
        <fog attach="fog" args={['#2a2410', 6, 35]} />
        <ambientLight intensity={0.2} color={LIGHT_COLOR} />

        <FPSControls
          speed={4}
          sprintMultiplier={1.6}
          bounds={WORLD_BOUNDS}
          walls={WALL_BOXES}
          joystickRef={joystickRef}
          onPositionChange={handlePositionChange}
        />

        <PlayerPosContext.Provider value={playerPosRef}>
          <BackroomsEnvironment />
          {projects.map((project, i) => (
            <ProjectNode
              key={i}
              project={project}
              index={i}
              position={PROJECT_POSITIONS[i]}
              onDiscover={() => handleDiscover(i)}
            />
          ))}
        </PlayerPosContext.Provider>

        <DustParticles />
      </Canvas>

      <WorldHUD
        worldName="BACKROOMS // PROJECTS"
        accentColor="#c4b67c"
        discovered={foundProjects.size}
        total={projects.length}
        itemLabel="PROJECTS"
        position={hudPos}
        markers={markers}
      />

      {isMobile && <MobileJoystick joystickRef={joystickRef} />}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   BACKROOMS ENVIRONMENT — lightweight
   ═══════════════════════════════════════════════ */
function BackroomsEnvironment() {
  // All textures via CanvasTexture (created once)
  const wallTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 64; c.height = 128
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#c4b67c'
    ctx.fillRect(0, 0, 64, 128)
    for (let x = 0; x < 64; x += 8) {
      ctx.fillStyle = x % 16 === 0 ? '#b8a96e' : '#ccc088'
      ctx.fillRect(x, 0, 2, 128)
    }
    const grad = ctx.createLinearGradient(0, 80, 0, 128)
    grad.addColorStop(0, 'rgba(100,80,40,0)')
    grad.addColorStop(1, 'rgba(100,80,40,0.3)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 80, 64, 48)
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(4, 1)
    return tex
  }, [])

  const carpetTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 64; c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = CARPET
    ctx.fillRect(0, 0, 64, 64)
    for (let i = 0; i < 800; i++) {
      const shade = Math.random() * 30 - 15
      ctx.fillStyle = `rgba(${139 + shade},${125 + shade},${94 + shade},0.5)`
      ctx.fillRect(Math.random() * 64, Math.random() * 64, 1, 1)
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(8, CORRIDOR_LENGTH / 4)
    return tex
  }, [])

  const ceilingTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 64; c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = CEILING_COLOR
    ctx.fillRect(0, 0, 64, 64)
    ctx.strokeStyle = '#b0a878'
    ctx.lineWidth = 1
    ctx.strokeRect(1, 1, 62, 62)
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(8, CORRIDOR_LENGTH / 3)
    return tex
  }, [])

  // Use a single shared wall material
  const wallMat = useMemo(() => new THREE.MeshLambertMaterial({ map: wallTexture }), [wallTexture])
  const carpetMat = useMemo(() => new THREE.MeshLambertMaterial({ map: carpetTexture }), [carpetTexture])
  const ceilingMat = useMemo(() => new THREE.MeshLambertMaterial({ map: ceilingTexture }), [ceilingTexture])

  const segmentCount = Math.ceil(CORRIDOR_LENGTH / 8)
  const lightCount = Math.floor(CORRIDOR_LENGTH / 14)

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -CORRIDOR_LENGTH / 2]} material={carpetMat}>
        <planeGeometry args={[16, CORRIDOR_LENGTH]} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, -CORRIDOR_LENGTH / 2]} material={ceilingMat}>
        <planeGeometry args={[16, CORRIDOR_LENGTH]} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-8, 1.6, -CORRIDOR_LENGTH / 2]} rotation={[0, Math.PI / 2, 0]} material={wallMat}>
        <planeGeometry args={[CORRIDOR_LENGTH, 3.2]} />
      </mesh>
      {/* Right wall */}
      <mesh position={[8, 1.6, -CORRIDOR_LENGTH / 2]} rotation={[0, -Math.PI / 2, 0]} material={wallMat}>
        <planeGeometry args={[CORRIDOR_LENGTH, 3.2]} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 1.6, 5]} material={wallMat}>
        <planeGeometry args={[16, 3.2]} />
      </mesh>

      {/* Partition walls with doorway openings */}
      {Array.from({ length: segmentCount }, (_, i) => {
        const z = -i * 8 - 4
        const side = i % 2 === 0 ? 1 : -1
        // Create a gap (doorway) near the corridor center
        const wallCenter = side * 4
        const wallMinX = wallCenter - 4
        const wallMaxX = wallCenter + 4
        const doorCenter = side > 0 ? wallMinX + 1 : wallMaxX - 1
        const doorHalf = DOORWAY_WIDTH / 2

        const leftLen = Math.max(0, doorCenter - doorHalf - wallMinX)
        const rightLen = Math.max(0, wallMaxX - (doorCenter + doorHalf))
        const leftCenter = wallMinX + leftLen / 2
        const rightCenter = wallMaxX - rightLen / 2

        return (
          <group key={i} position={[0, 0, z]}>
            {/* Left portion of horizontal wall */}
            {leftLen > 0.3 && (
              <mesh position={[leftCenter, 1.6, 0]} material={wallMat}>
                <boxGeometry args={[leftLen, 3.2, WALL_THICKNESS]} />
              </mesh>
            )}
            {/* Right portion of horizontal wall */}
            {rightLen > 0.3 && (
              <mesh position={[rightCenter, 1.6, 0]} material={wallMat}>
                <boxGeometry args={[rightLen, 3.2, WALL_THICKNESS]} />
              </mesh>
            )}
            {/* Doorway frame (top) */}
            <mesh position={[doorCenter, 2.9, 0]} material={wallMat}>
              <boxGeometry args={[DOORWAY_WIDTH + 0.1, 0.6, WALL_THICKNESS]} />
            </mesh>
            {/* Vertical partition */}
            <mesh position={[side * 0.07, 1.6, side * 2]} rotation={[0, Math.PI / 2, 0]} material={wallMat}>
              <boxGeometry args={[4, 3.2, WALL_THICKNESS]} />
            </mesh>
          </group>
        )
      })}

      {/* Fewer ceiling lights — static emissive panels + pointLights */}
      {Array.from({ length: lightCount }, (_, i) => (
        <CeilingLight key={i} position={[0, 3.15, -i * 14 - 5]} index={i} />
      ))}
    </group>
  )
}

/* ── Ceiling light: static emissive panel + single pointLight, no per-frame flicker ── */
const LIGHT_FIXTURE_GEO = new THREE.BoxGeometry(1.2, 0.04, 0.3)
const DEAD_MAT = new THREE.MeshLambertMaterial({ color: '#666' })
const GLOW_MAT = new THREE.MeshStandardMaterial({
  color: '#eee',
  emissive: LIGHT_COLOR,
  emissiveIntensity: 1.5,
  toneMapped: false,
})

function CeilingLight({ position, index }: { position: [number, number, number]; index: number }) {
  const broken = useMemo(() => Math.random() < 0.12, [])
  const dim = useMemo(() => Math.random() < 0.2, [])

  if (broken) {
    return (
      <mesh position={position} geometry={LIGHT_FIXTURE_GEO} material={DEAD_MAT} />
    )
  }

  return (
    <group position={position}>
      <pointLight
        color={LIGHT_COLOR}
        intensity={dim ? 0.8 : 2}
        distance={12}
        decay={2}
      />
      <mesh geometry={LIGHT_FIXTURE_GEO} material={GLOW_MAT} />
    </group>
  )
}

/* ═══════════════════════════════════════════════
   PROJECT NODE — reads position from context ref
   ═══════════════════════════════════════════════ */
function ProjectNode({
  project,
  index,
  position,
  onDiscover,
}: {
  project: (typeof projects)[0]
  index: number
  position: { x: number; z: number; rotation: number }
  onDiscover: () => void
}) {
  const playerPosRef = useContext(PlayerPosContext)
  const colors = ['#00f0ff', '#8b5cf6', '#ff006e', '#0066ff', '#00ff88']
  const color = colors[index % colors.length]
  const panelRef = useRef<THREE.Mesh>(null)
  const borderRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const discoveredRef = useRef(false)
  const wasNear = useRef(false)
  const frameCount = useRef(0)
  const [isNear, setIsNear] = useState(false)

  useFrame(() => {
    frameCount.current++
    if (frameCount.current < 15) return
    frameCount.current = 0

    const pp = playerPosRef.current
    const dx = pp.x - position.x
    const dz = pp.z - position.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const near = dist < 6

    if (near !== wasNear.current) {
      wasNear.current = near
      setIsNear(near)
      // Update materials directly (no re-render needed for these)
      if (panelRef.current) {
        (panelRef.current.material as THREE.MeshBasicMaterial).opacity = near ? 0.85 : 0.5
      }
      if (borderRef.current) {
        (borderRef.current.material as THREE.MeshBasicMaterial).opacity = near ? 0.2 : 0.08
      }
      if (lightRef.current) {
        lightRef.current.intensity = near ? 1.5 : 0.3
      }
    }
    if (dist < 4 && !discoveredRef.current) {
      discoveredRef.current = true
      onDiscover()
    }
  })

  // Use MeshBasicMaterial for panels (no lighting calc needed)
  return (
    <group
      position={[position.x, 0, position.z]}
      rotation={[0, position.rotation, 0]}
    >
      <group position={[0, 1.8, 0]}>
        {/* Dark panel */}
        <mesh ref={panelRef}>
          <planeGeometry args={[2.8, 1.8]} />
          <meshBasicMaterial color="#0a0a15" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>

        {/* Border */}
        <mesh ref={borderRef} position={[0, 0, -0.005]}>
          <planeGeometry args={[2.9, 1.9]} />
          <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>

        {/* Video */}
        {project.video && (
          <VideoScreen
            videoSrc={project.video}
            position={[0, 0.2, 0.01]}
            size={[2.6, 1.2]}
            isNear={isNear}
          />
        )}

        {/* Title */}
        <Text
          position={[0, project.video ? -0.55 : 0.5, 0.01]}
          fontSize={0.12}
          color={color}
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron.woff"
          maxWidth={2.4}
        >
          {project.title.toUpperCase()}
        </Text>

        {/* Description */}
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

      <pointLight
        ref={lightRef}
        position={[0, 0.5, 0]}
        color={color}
        intensity={0.3}
        distance={5}
        decay={2}
      />
    </group>
  )
}

/* ── Video screen — lazy load, only create video element when near ── */
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
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!isNear || loadedRef.current) return
    // Lazy-load: only create video element when player approaches
    loadedRef.current = true
    const video = document.createElement('video')
    video.src = videoSrc
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.autoplay = true
    videoRef.current = video

    const tex = new THREE.VideoTexture(video)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.colorSpace = THREE.SRGBColorSpace
    setVideoTexture(tex)

    video.play().catch(() => {})

    return () => {
      video.pause()
      video.src = ''
      tex.dispose()
    }
  }, [isNear, videoSrc])

  // Play/pause based on proximity (after loaded)
  useEffect(() => {
    const video = videoRef.current
    if (!video || !loadedRef.current) return
    if (isNear) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [isNear])

  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      {videoTexture ? (
        <meshBasicMaterial map={videoTexture} toneMapped={false} />
      ) : (
        <meshBasicMaterial color="#111" transparent opacity={0.5} />
      )}
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
