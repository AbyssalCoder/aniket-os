'use client'

import { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { skillCategories } from '@/data/resume'
import FPSControls, { type WallBox } from './FPSControls'
import WorldHUD from './WorldHUD'
import MobileJoystick from './MobileJoystick'

/* ── Flatten all skills for total count ── */
const ALL_SKILLS = skillCategories.flatMap((cat) =>
  cat.items.map((skill) => ({ skill, category: cat.label, color: cat.color, icon: cat.icon }))
)

/* ── Hospital corridor layout — rooms branch off a main hallway ── */
const ROOM_SPACING = 12
const HALLWAY_LENGTH = skillCategories.length * ROOM_SPACING + 20
const HALLWAY_WIDTH = 4
const ROOM_WIDTH = 8
const ROOM_DEPTH = 6

const CATEGORY_POSITIONS = skillCategories.map((_, i) => {
  const side = i % 2 === 0 ? -1 : 1
  const z = -(i * ROOM_SPACING + 10)
  return { x: side * (HALLWAY_WIDTH / 2 + ROOM_DEPTH / 2 + 0.15), z, side }
})

/* ── Colors ── */
const WALL_COLOR = '#e8e0d0'
const FLOOR_COLOR = '#c8bfaf'
const CEIL_COLOR = '#d8d0c0'
const LIGHT_COLOR = '#f0ece0'

/* ── Wall collision boxes ── */
const WALL_T = 0.15

function buildHospitalWalls(): WallBox[] {
  const walls: WallBox[] = []
  const hw = HALLWAY_WIDTH / 2
  const doorWidth = 2.4

  // Back wall
  walls.push([-hw - ROOM_DEPTH - 1, hw + ROOM_DEPTH + 1, 5 - WALL_T / 2, 5 + WALL_T / 2])

  // Left and right hallway walls with doorway gaps
  for (const side of [-1, 1]) {
    const wallX = side * hw
    const roomsOnSide = CATEGORY_POSITIONS
      .filter(p => p.side === side)
      .sort((a, b) => b.z - a.z)

    let lastZ = 5
    for (const room of roomsOnSide) {
      const doorMax = room.z + doorWidth / 2
      const doorMin = room.z - doorWidth / 2
      if (lastZ > doorMax + 0.3) {
        walls.push([wallX - WALL_T, wallX + WALL_T, doorMax, lastZ])
      }
      lastZ = doorMin
    }
    if (lastZ > -HALLWAY_LENGTH) {
      walls.push([wallX - WALL_T, wallX + WALL_T, -HALLWAY_LENGTH, lastZ])
    }
  }

  // Room walls (back + two sides per room)
  for (let i = 0; i < skillCategories.length; i++) {
    const pos = CATEGORY_POSITIONS[i]
    const rw = ROOM_WIDTH / 2
    const rd = ROOM_DEPTH / 2
    const farX = pos.x + pos.side * rd

    // Back wall of room
    walls.push([farX - WALL_T / 2, farX + WALL_T / 2, pos.z - rw, pos.z + rw])
    // Side walls
    const minX = Math.min(pos.side * (hw), farX)
    const maxX = Math.max(pos.side * (hw), farX)
    walls.push([minX - WALL_T / 2, maxX + WALL_T / 2, pos.z + rw - WALL_T / 2, pos.z + rw + WALL_T / 2])
    walls.push([minX - WALL_T / 2, maxX + WALL_T / 2, pos.z - rw - WALL_T / 2, pos.z - rw + WALL_T / 2])
  }

  return walls
}

const HOSPITAL_WALLS = buildHospitalWalls()
const WORLD_BOUNDS: [number, number, number, number] = [
  -(HALLWAY_WIDTH / 2 + ROOM_DEPTH + 1),
  HALLWAY_WIDTH / 2 + ROOM_DEPTH + 1,
  -HALLWAY_LENGTH,
  5,
]

export default function SkillsWorld() {
  const playerPosRef = useRef({ x: 0, z: 0 })
  const [hudPos, setHudPos] = useState({ x: 0, z: 0 })
  const [foundSkills, setFoundSkills] = useState<Set<string>>(new Set())
  const hudUpdateRef = useRef(0)
  const joystickRef = useRef({ mx: 0, mz: 0, cx: 0, cy: 0 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const handleDiscover = useCallback((skill: string) => {
    setFoundSkills(prev => {
      if (prev.has(skill)) return prev
      const next = new Set(prev)
      next.add(skill)
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

  const markers = useMemo(() => CATEGORY_POSITIONS.map((p, i) => ({
    x: p.x,
    z: p.z,
    found: skillCategories[i].items.every(s => foundSkills.has(s)),
    label: skillCategories[i].label,
  })), [foundSkills])

  return (
    <div className="fixed inset-0 z-40">
      <Canvas
        camera={{ position: [0, 1.7, 3], fov: 70, near: 0.1, far: 80 }}
        dpr={[1, 1]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        frameloop="always"
      >
        <color attach="background" args={['#1a1812']} />
        <fog attach="fog" args={['#1a1812', 6, 35]} />
        <ambientLight intensity={0.25} color={LIGHT_COLOR} />

        <FPSControls
          speed={4}
          sprintMultiplier={1.6}
          bounds={WORLD_BOUNDS}
          walls={HOSPITAL_WALLS}
          joystickRef={joystickRef}
          onPositionChange={handlePositionChange}
        />

        <HospitalEnvironment />

        {skillCategories.map((cat, i) => (
          <SkillRoom
            key={cat.id}
            category={cat}
            position={CATEGORY_POSITIONS[i]}
            playerPosRef={playerPosRef}
            foundSkills={foundSkills}
            onDiscover={handleDiscover}
          />
        ))}

        <DustParticles />
      </Canvas>

      <WorldHUD
        worldName="HOSPITAL // SKILLS"
        accentColor="#6b8f71"
        discovered={foundSkills.size}
        total={ALL_SKILLS.length}
        itemLabel="SKILLS"
        position={hudPos}
        markers={markers}
      />

      {isMobile && <MobileJoystick joystickRef={joystickRef} />}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   HOSPITAL ENVIRONMENT
   ═══════════════════════════════════════════════ */
function HospitalEnvironment() {
  const wallTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 64; c.height = 128
    const ctx = c.getContext('2d')!
    ctx.fillStyle = WALL_COLOR
    ctx.fillRect(0, 0, 64, 128)
    ctx.fillStyle = '#d0c8b8'
    ctx.fillRect(0, 80, 64, 2)
    ctx.fillStyle = 'rgba(0,0,0,0.04)'
    ctx.fillRect(0, 82, 64, 46)
    ctx.fillStyle = '#6b8f71'
    ctx.fillRect(0, 124, 64, 4)
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(4, 1)
    return tex
  }, [])

  const floorTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 64; c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = FLOOR_COLOR
    ctx.fillRect(0, 0, 64, 64)
    ctx.strokeStyle = '#b8af9f'
    ctx.lineWidth = 0.5
    for (let x = 0; x < 64; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 64); ctx.stroke() }
    for (let y = 0; y < 64; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(64, y); ctx.stroke() }
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = `rgba(${100 + Math.random() * 30}, ${90 + Math.random() * 30}, ${70 + Math.random() * 30}, 0.1)`
      ctx.fillRect(Math.random() * 64, Math.random() * 64, 2, 2)
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(6, HALLWAY_LENGTH / 4)
    return tex
  }, [])

  const ceilingTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 64; c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = CEIL_COLOR
    ctx.fillRect(0, 0, 64, 64)
    ctx.strokeStyle = '#c0b8a8'
    ctx.lineWidth = 1
    ctx.strokeRect(2, 2, 60, 60)
    ctx.fillStyle = 'rgba(160,140,100,0.08)'
    ctx.beginPath(); ctx.arc(32, 32, 12, 0, Math.PI * 2); ctx.fill()
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(6, HALLWAY_LENGTH / 3)
    return tex
  }, [])

  const wallMat = useMemo(() => new THREE.MeshLambertMaterial({ map: wallTexture, side: THREE.DoubleSide }), [wallTexture])
  const floorMat = useMemo(() => new THREE.MeshLambertMaterial({ map: floorTexture, side: THREE.DoubleSide }), [floorTexture])
  const ceilMat = useMemo(() => new THREE.MeshLambertMaterial({ map: ceilingTexture, side: THREE.DoubleSide }), [ceilingTexture])

  const lightCount = Math.floor(HALLWAY_LENGTH / 10)
  const hw = HALLWAY_WIDTH / 2

  return (
    <group>
      {/* Main hallway floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -HALLWAY_LENGTH / 2]} material={floorMat}>
        <planeGeometry args={[HALLWAY_WIDTH + 0.5, HALLWAY_LENGTH]} />
      </mesh>
      {/* Main hallway ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, -HALLWAY_LENGTH / 2]} material={ceilMat}>
        <planeGeometry args={[HALLWAY_WIDTH + 0.5, HALLWAY_LENGTH]} />
      </mesh>

      {/* Hallway walls with room doorway gaps */}
      <HallwayWalls wallMat={wallMat} />

      {/* Room structures */}
      {skillCategories.map((_, i) => (
        <RoomStructure key={i} position={CATEGORY_POSITIONS[i]} wallMat={wallMat} floorMat={floorMat} ceilMat={ceilMat} index={i} />
      ))}

      {/* Back wall */}
      <mesh position={[0, 1.6, 5]} material={wallMat}>
        <planeGeometry args={[HALLWAY_WIDTH + 0.5, 3.2]} />
      </mesh>

      {/* Hallway ceiling lights */}
      {Array.from({ length: lightCount }, (_, i) => (
        <HospitalLight key={i} position={[0, 3.15, -i * 10 - 5]} index={i} />
      ))}

      {/* Ward signs */}
      {skillCategories.map((cat, i) => {
        const pos = CATEGORY_POSITIONS[i]
        return (
          <group key={i}>
            <mesh position={[pos.side * (hw - 0.05), 2.7, pos.z + 1.8 * pos.side]}>
              <planeGeometry args={[1.2, 0.35]} />
              <meshBasicMaterial color="#1a3a20" />
            </mesh>
            <Text
              position={[pos.side * (hw - 0.04), 2.7, pos.z + 1.8 * pos.side + 0.01 * pos.side]}
              fontSize={0.1}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              font="/fonts/orbitron.woff"
              rotation={[0, pos.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
            >
              {`WARD ${String(i + 1).padStart(2, '0')} — ${cat.label.toUpperCase()}`}
            </Text>
          </group>
        )
      })}
    </group>
  )
}

/* ── Hallway walls with room doorway gaps ── */
function HallwayWalls({ wallMat }: { wallMat: THREE.Material }) {
  const hw = HALLWAY_WIDTH / 2
  const doorWidth = 2.4

  const segments = useMemo(() => {
    const segs: { side: number; z1: number; z2: number }[] = []
    for (const side of [-1, 1]) {
      const roomsOnSide = CATEGORY_POSITIONS
        .filter(p => p.side === side)
        .sort((a, b) => b.z - a.z)
      let lastZ = 5
      for (const room of roomsOnSide) {
        const doorMax = room.z + doorWidth / 2
        const doorMin = room.z - doorWidth / 2
        if (lastZ > doorMax + 0.3) segs.push({ side, z1: doorMax, z2: lastZ })
        lastZ = doorMin
      }
      if (lastZ > -HALLWAY_LENGTH) segs.push({ side, z1: -HALLWAY_LENGTH, z2: lastZ })
    }
    return segs
  }, [])

  return (
    <>
      {segments.map((seg, i) => {
        const len = seg.z2 - seg.z1
        const centerZ = (seg.z1 + seg.z2) / 2
        return (
          <mesh key={i} position={[seg.side * hw, 1.6, centerZ]} rotation={[0, seg.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]} material={wallMat}>
            <planeGeometry args={[len, 3.2]} />
          </mesh>
        )
      })}
      {CATEGORY_POSITIONS.map((pos, i) => (
        <mesh key={`frame-${i}`} position={[pos.side * hw, 2.9, pos.z]} rotation={[0, pos.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]} material={wallMat}>
          <planeGeometry args={[doorWidth + 0.2, 0.6]} />
        </mesh>
      ))}
      {/* Door jamb posts — visible colored markers so door is findable from inside */}
      {CATEGORY_POSITIONS.map((pos, i) => {
        const x = pos.side * hw
        return (
          <group key={`jamb-${i}`}>
            <mesh position={[x, 1.4, pos.z + doorWidth / 2]}>
              <boxGeometry args={[0.12, 2.8, 0.12]} />
              <meshStandardMaterial color="#4a6b50" emissive="#2a4a30" emissiveIntensity={0.3} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[x, 1.4, pos.z - doorWidth / 2]}>
              <boxGeometry args={[0.12, 2.8, 0.12]} />
              <meshStandardMaterial color="#4a6b50" emissive="#2a4a30" emissiveIntensity={0.3} side={THREE.DoubleSide} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

/* ── Room structure ── */
function RoomStructure({ position, wallMat, floorMat, ceilMat, index }: {
  position: { x: number; z: number; side: number }; wallMat: THREE.Material; floorMat: THREE.Material; ceilMat: THREE.Material; index: number
}) {
  const hw = HALLWAY_WIDTH / 2
  const rw = ROOM_WIDTH / 2
  const rd = ROOM_DEPTH / 2
  const farX = position.x + position.side * rd

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position.x, 0.01, position.z]} material={floorMat}>
        <planeGeometry args={[ROOM_DEPTH, ROOM_WIDTH]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[position.x, 3.19, position.z]} material={ceilMat}>
        <planeGeometry args={[ROOM_DEPTH, ROOM_WIDTH]} />
      </mesh>
      <mesh position={[farX, 1.6, position.z]} rotation={[0, position.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]} material={wallMat}>
        <planeGeometry args={[ROOM_WIDTH, 3.2]} />
      </mesh>
      <mesh position={[(position.side * hw + farX) / 2, 1.6, position.z + rw]} material={wallMat}>
        <planeGeometry args={[ROOM_DEPTH + WALL_T, 3.2]} />
      </mesh>
      <mesh position={[(position.side * hw + farX) / 2, 1.6, position.z - rw]} rotation={[0, Math.PI, 0]} material={wallMat}>
        <planeGeometry args={[ROOM_DEPTH + WALL_T, 3.2]} />
      </mesh>
      <HospitalLight position={[position.x, 3.15, position.z]} index={index + 100} />
    </group>
  )
}

/* ── Hospital ceiling light ── */
const H_LIGHT_GEO = new THREE.BoxGeometry(1.0, 0.04, 0.25)
const H_DEAD_MAT = new THREE.MeshLambertMaterial({ color: '#888' })
const H_GLOW_MAT = new THREE.MeshStandardMaterial({ color: '#fff', emissive: LIGHT_COLOR, emissiveIntensity: 1.5, toneMapped: false })

function HospitalLight({ position, index }: { position: [number, number, number]; index: number }) {
  const broken = useMemo(() => Math.random() < 0.1, [])
  const dim = useMemo(() => Math.random() < 0.15, [])
  if (broken) return <mesh position={position} geometry={H_LIGHT_GEO} material={H_DEAD_MAT} />
  return (
    <group position={position}>
      <pointLight color={LIGHT_COLOR} intensity={dim ? 0.6 : 1.8} distance={10} decay={2} />
      <mesh geometry={H_LIGHT_GEO} material={H_GLOW_MAT} />
    </group>
  )
}

/* ═══════════════════════════════════════════════
   SKILL ROOM — hospital ward with skill panels
   ═══════════════════════════════════════════════ */
function SkillRoom({
  category, position, playerPosRef, foundSkills, onDiscover,
}: {
  category: (typeof skillCategories)[0]; position: { x: number; z: number; side: number }
  playerPosRef: React.MutableRefObject<{ x: number; z: number }>; foundSkills: Set<string>; onDiscover: (skill: string) => void
}) {
  const frameCount = useRef(0)
  const discoveredRef = useRef(false)

  useFrame(() => {
    frameCount.current++
    if (frameCount.current < 15) return
    frameCount.current = 0
    if (discoveredRef.current) return
    const pp = playerPosRef.current
    const dx = pp.x - position.x
    const dz = pp.z - position.z
    if (Math.sqrt(dx * dx + dz * dz) < 5) {
      discoveredRef.current = true
      category.items.forEach(skill => { if (!foundSkills.has(skill)) onDiscover(skill) })
    }
  })

  const allFound = category.items.every(s => foundSkills.has(s))
  const farX = position.x + position.side * (ROOM_DEPTH / 2 - 0.3)

  return (
    <group>
      <Text
        position={[farX - position.side * 0.01, 2.5, position.z]}
        fontSize={0.18} color={category.color} anchorX="center" anchorY="middle"
        font="/fonts/orbitron.woff"
        rotation={[0, position.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
      >
        {`${category.icon} ${category.label.toUpperCase()}`}
      </Text>

      <Text
        position={[farX - position.side * 0.01, 2.2, position.z]}
        fontSize={0.1} color={allFound ? '#00ff88' : '#ffffff60'} anchorX="center" anchorY="middle"
        rotation={[0, position.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
      >
        {allFound ? '✓ ALL DISCOVERED' : `${category.items.filter(s => foundSkills.has(s)).length}/${category.items.length} DISCOVERED`}
      </Text>

      {category.items.map((skill, i) => {
        const found = foundSkills.has(skill)
        const col = i % 5
        const row = Math.floor(i / 5)
        const zOff = (col - 2) * 1.4
        const yPos = 1.5 - row * 0.5
        return (
          <group key={skill}>
            <mesh position={[farX - position.side * 0.02, yPos, position.z + zOff]}
              rotation={[0, position.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
              <planeGeometry args={[1.1, 0.35]} />
              <meshBasicMaterial color={found ? '#0a2a10' : '#0a0a15'} transparent opacity={0.7} />
            </mesh>
            <mesh position={[farX - position.side * 0.015, yPos + 0.16, position.z + zOff]}
              rotation={[0, position.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
              <planeGeometry args={[1.1, 0.02]} />
              <meshBasicMaterial color={found ? '#00ff88' : category.color} />
            </mesh>
            <Text
              position={[farX - position.side * 0.03, yPos, position.z + zOff]}
              fontSize={0.065} color={found ? '#00ff88' : `${category.color}cc`}
              anchorX="center" anchorY="middle" maxWidth={1}
              rotation={[0, position.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
            >
              {skill}
            </Text>
          </group>
        )
      })}

      <pointLight position={[position.x, 1, position.z]} color={category.color}
        intensity={allFound ? 1.5 : 0.4} distance={6} decay={2} />
    </group>
  )
}

/* ── Dust Particles ── */
function DustParticles() {
  const count = 150
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14
      pos[i * 3 + 1] = Math.random() * 3
      pos[i * 3 + 2] = Math.random() * -HALLWAY_LENGTH
    }
    return pos
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#d4c89a" size={0.02} transparent opacity={0.2} sizeAttenuation />
    </points>
  )
}

