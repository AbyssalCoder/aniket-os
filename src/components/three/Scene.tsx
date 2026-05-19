'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Preload } from '@react-three/drei'
import AICore from './AICore'
import ParticleField from './ParticleField'

interface SceneProps {
  mousePos: { x: number; y: number }
}

/**
 * Scene — Fixed full-viewport Three.js canvas rendered behind all content.
 * Contains the AI Core orb and ambient particle field.
 * Uses postprocessing for bloom glow.
 */
export default function Scene({ mousePos }: SceneProps) {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Ambient lighting */}
          <ambientLight intensity={0.15} />
          <pointLight position={[5, 5, 5]} intensity={0.4} color="#00f0ff" />
          <pointLight position={[-5, -3, 3]} intensity={0.2} color="#8b5cf6" />

          {/* Main AI Core orb */}
          <AICore mousePos={mousePos} />

          {/* Ambient particles */}
          <ParticleField count={800} />

          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}
