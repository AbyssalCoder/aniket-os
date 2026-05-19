'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleFieldProps {
  count?: number
}

/**
 * ParticleField — Thousands of floating dots drifting slowly through 3D space.
 * Uses instanced points for GPU efficiency. Creates the ambient "space dust"
 * atmosphere behind the entire site.
 */
export default function ParticleField({ count = 800 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null!)

  /* Generate random positions & sizes once */
  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sz = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // Spread in a large box
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
      sz[i] = Math.random() * 2 + 0.5
    }
    return { positions: pos, sizes: sz }
  }, [count])

  /* Custom shader for size attenuation + colour */
  const shaderArgs = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#00f0ff') },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        uniform float uTime;
        varying float vAlpha;

        void main() {
          vec3 pos = position;
          // Gentle drift
          pos.y += sin(uTime * 0.1 + position.x * 0.5) * 0.3;
          pos.x += cos(uTime * 0.08 + position.z * 0.3) * 0.2;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = aSize * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;

          // Fade with distance
          vAlpha = smoothstep(30.0, 5.0, -mvPosition.z) * 0.6;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vAlpha;

        void main() {
          // Circular point
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float strength = 1.0 - smoothstep(0.0, 0.5, d);
          gl_FragColor = vec4(uColor, strength * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    []
  )

  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial
      material.uniforms.uTime.value = state.clock.elapsedTime
      // Very slow rotation of entire field
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial attach="material" {...shaderArgs} />
    </points>
  )
}
