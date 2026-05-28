'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Float, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { skillCategories } from '@/data/resume'
import FPSControls from './FPSControls'
import WorldHUD from './WorldHUD'

/* ── Flatten all skills for total count ── */
const ALL_SKILLS = skillCategories.flatMap((cat) =>
  cat.items.map((skill) => ({ skill, category: cat.label, color: cat.color, icon: cat.icon }))
)

/* ── Arrange skill categories in a ring ── */
const CATEGORY_POSITIONS = skillCategories.map((_, i) => {
  const angle = (i / skillCategories.length) * Math.PI * 2 - Math.PI / 2
  const radius = 18
  return {
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
    angle,
  }
})

export default function SkillsWorld() {
  const playerPosRef = useRef({ x: 0, z: 0 })
  const [hudPos, setHudPos] = useState({ x: 0, z: 0 })
  const [foundSkills, setFoundSkills] = useState<Set<string>>(new Set())
  const hudUpdateRef = useRef(0)

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
        camera={{ position: [0, 1.7, 0], fov: 70, near: 0.1, far: 80 }}
        dpr={[1, 1]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#010114']} />
        <fog attach="fog" args={['#010114', 10, 50]} />
        <ambientLight intensity={0.08} />

        <FPSControls
          speed={5}
          sprintMultiplier={2}
          bounds={[-30, 30, -30, 30]}
          onPositionChange={handlePositionChange}
        />

        <CyberEnvironment />

        {skillCategories.map((cat, i) => (
          <SkillStation
            key={cat.id}
            category={cat}
            position={CATEGORY_POSITIONS[i]}
            playerPosRef={playerPosRef}
            foundSkills={foundSkills}
            onDiscover={handleDiscover}
          />
        ))}

        <DataStreams />
      </Canvas>

      <WorldHUD
        worldName="SIMULATION // SKILLS"
        accentColor="#00f0ff"
        discovered={foundSkills.size}
        total={ALL_SKILLS.length}
        itemLabel="SKILLS"
        position={hudPos}
        markers={markers}
      />
    </div>
  )
}

/* ── Cyber Environment ── */
function CyberEnvironment() {
  return (
    <group>
      {/* Neon grid floor */}
      <Grid
        args={[100, 100]}
        cellSize={2}
        cellThickness={0.5}
        cellColor="#00f0ff"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#8b5cf6"
        fadeDistance={60}
        fadeStrength={1}
        followCamera={false}
        position={[0, 0, 0]}
      />

      {/* Reflective floor under grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#020216" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Central structure — hexagonal platform */}
      <CentralPlatform />

      {/* Data tunnel arches around the perimeter */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const r = 28
        return (
          <DataArch
            key={i}
            position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
            rotation={[0, -angle + Math.PI / 2, 0]}
          />
        )
      })}

      {/* Floating geometry — reduced to 5, static rotation */}
      {Array.from({ length: 5 }, (_, i) => (
        <FloatingGeometry key={i} index={i} />
      ))}
    </group>
  )
}

/* ── Central Platform ── */
function CentralPlatform() {
  return (
    <group>
      {/* Inner ring */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.03, 8, 64]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      {/* Outer ring */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[5, 0.02, 8, 64]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={2}
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      </mesh>
      {/* Center light */}
      <pointLight position={[0, 2, 0]} color="#00f0ff" intensity={2} distance={15} />

      {/* Title text */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.5}
        color="#00f0ff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/orbitron.woff"
      >
        SKILL MATRIX
      </Text>
    </group>
  )
}

/* ── Data Arch ── */
function DataArch({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Arch pillars */}
      <mesh position={[-2, 3, 0]}>
        <boxGeometry args={[0.1, 6, 0.1]} />
        <meshStandardMaterial color="#0066ff" emissive="#0066ff" emissiveIntensity={1} toneMapped={false} />
      </mesh>
      <mesh position={[2, 3, 0]}>
        <boxGeometry args={[0.1, 6, 0.1]} />
        <meshStandardMaterial color="#0066ff" emissive="#0066ff" emissiveIntensity={1} toneMapped={false} />
      </mesh>
      {/* Top bar */}
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[4.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#0066ff" emissive="#0066ff" emissiveIntensity={1} toneMapped={false} />
      </mesh>
    </group>
  )
}

/* ── Floating Geometry ── */
function FloatingGeometry({ index }: { index: number }) {
  const props = useMemo(() => ({
    x: (Math.random() - 0.5) * 60,
    y: 3 + Math.random() * 10,
    z: (Math.random() - 0.5) * 60,
    scale: 0.2 + Math.random() * 0.5,
    color: ['#00f0ff', '#8b5cf6', '#ff006e', '#0066ff'][index % 4],
  }), [index])

  return (
    <mesh position={[props.x, props.y, props.z]} scale={props.scale}>
      {index % 3 === 0 ? (
        <octahedronGeometry args={[1]} />
      ) : index % 3 === 1 ? (
        <boxGeometry args={[1, 1, 1]} />
      ) : (
        <tetrahedronGeometry args={[1]} />
      )}
      <meshStandardMaterial
        color={props.color}
        emissive={props.color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.3}
        wireframe
        toneMapped={false}
      />
    </mesh>
  )
}

/* ── Skill Station ── */
function SkillStation({
  category,
  position,
  playerPosRef,
  foundSkills,
  onDiscover,
}: {
  category: (typeof skillCategories)[0]
  position: { x: number; z: number; angle: number }
  playerPosRef: React.MutableRefObject<{ x: number; z: number }>
  foundSkills: Set<string>
  onDiscover: (skill: string) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
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
    const dist = Math.sqrt(dx * dx + dz * dz)

    if (dist < 5) {
      discoveredRef.current = true
      category.items.forEach(skill => {
        if (!foundSkills.has(skill)) onDiscover(skill)
      })
    }
  })

  const discoveredCount = category.items.filter(s => foundSkills.has(s)).length
  const allFound = discoveredCount === category.items.length

  return (
    <group ref={groupRef} position={[position.x, 0, position.z]}>
      {/* Base ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <torusGeometry args={[2, 0.03, 8, 32]} />
        <meshStandardMaterial
          color={category.color}
          emissive={category.color}
          emissiveIntensity={allFound ? 4 : 2}
          toneMapped={false}
        />
      </mesh>

      {/* Central orb — no per-frame animation */}
      <Float speed={1.5} floatIntensity={0.5}>
        <mesh position={[0, 2.5, 0]}>
          <icosahedronGeometry args={[0.6, 1]} />
          <meshStandardMaterial
            color={category.color}
            emissive={category.color}
            emissiveIntensity={3}
            wireframe
            toneMapped={false}
          />
        </mesh>
      </Float>

      {/* Point light */}
      <pointLight
        position={[0, 2.5, 0]}
        color={category.color}
        intensity={allFound ? 5 : 2}
        distance={12}
        decay={2}
      />

      {/* Category label */}
      <Text
        position={[0, 4.2, 0]}
        fontSize={0.3}
        color={category.color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/orbitron.woff"
      >
        {`${category.icon} ${category.label.toUpperCase()}`}
      </Text>

      {/* Count */}
      <Text
        position={[0, 3.7, 0]}
        fontSize={0.15}
        color={allFound ? '#00ff88' : '#ffffff60'}
        anchorX="center"
        anchorY="middle"
      >
        {`${discoveredCount}/${category.items.length}`}
      </Text>

      {/* Skill pills floating in a circle */}
      {category.items.map((skill, i) => {
        const a = (i / category.items.length) * Math.PI * 2
        const r = 3
        const found = foundSkills.has(skill)
        return (
          <SkillOrb
            key={skill}
            skill={skill}
            position={[Math.cos(a) * r, 1.5 + Math.sin(a * 2) * 0.5, Math.sin(a) * r]}
            color={category.color}
            found={found}
            index={i}
          />
        )
      })}

      {/* Vertical data beams */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 2, 2, Math.sin(angle) * 2]}>
          <cylinderGeometry args={[0.01, 0.01, 4, 4]} />
          <meshStandardMaterial
            color={category.color}
            emissive={category.color}
            emissiveIntensity={1}
            transparent
            opacity={0.2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ── Individual Skill Orb ── */
function SkillOrb({
  skill,
  position,
  color,
  found,
  index,
}: {
  skill: string
  position: [number, number, number]
  color: string
  found: boolean
  index: number
}) {
  // Static — no per-frame animation
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial
          color={found ? '#00ff88' : color}
          emissive={found ? '#00ff88' : color}
          emissiveIntensity={found ? 4 : 1}
          toneMapped={false}
        />
      </mesh>
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.08}
        color={found ? '#00ff88' : `${color}aa`}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.5}
      >
        {skill}
      </Text>
    </group>
  )
}

/* ── Data Stream Particles ── */
function DataStreams() {
  const count = 100
  const ref = useRef<THREE.Points>(null)
  const frameCount = useRef(0)
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = 5 + Math.random() * 25
      pos[i * 3] = Math.cos(angle) * r
      pos[i * 3 + 1] = Math.random() * 15
      pos[i * 3 + 2] = Math.sin(angle) * r
    }
    return pos
  }, [])

  useFrame(() => {
    if (!ref.current) return
    frameCount.current++
    if (frameCount.current < 3) return
    frameCount.current = 0
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] = (pos[i * 3 + 1] + 0.06) % 15
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#00f0ff" size={0.04} transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

