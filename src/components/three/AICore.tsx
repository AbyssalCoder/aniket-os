'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface AICoreProps {
  mousePos: { x: number; y: number }
}

/* ======= Custom Shaders ======= */

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  uniform float uTime;

  // Simplex-like noise (3D)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314*r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g, l.zxy);
    vec3 i2 = max(g, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x2_ = x_ * ns.x + ns.yyyy;
    vec4 y2_ = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x2_) - abs(y2_);
    vec4 b0 = vec4(x2_.xy, y2_.xy);
    vec4 b1 = vec4(x2_.zw, y2_.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    float noise = snoise(position * 1.8 + uTime * 0.25) * 0.12;
    vec3 displaced = position + normal * noise;

    vWorldPos = (modelMatrix * vec4(displaced, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);

    float t = sin(vWorldPos.y * 3.0 + uTime * 0.4) * 0.5 + 0.5;
    vec3 baseColor = mix(uColor1, uColor2, t);

    // Glow at edges
    vec3 glow = fresnel * 1.8 * vec3(0.0, 0.94, 1.0);
    vec3 color = baseColor * 0.4 + glow;

    float alpha = 0.10 + fresnel * 0.55;
    gl_FragColor = vec4(color, alpha);
  }
`

/**
 * AICore — Glowing, noise-displaced sphere with orbiting torus rings.
 * Reacts to mouse position for a parallax feel.
 */
export default function AICore({ mousePos }: AICoreProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const ring1 = useRef<THREE.Mesh>(null!)
  const ring2 = useRef<THREE.Mesh>(null!)
  const ring3 = useRef<THREE.Mesh>(null!)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#00f0ff') },
      uColor2: { value: new THREE.Color('#8b5cf6') },
    }),
    []
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    uniforms.uTime.value = t

    // Orbiting rings
    if (ring1.current) {
      ring1.current.rotation.x = Math.sin(t * 0.3) * 0.5 + 0.6
      ring1.current.rotation.y = t * 0.2
    }
    if (ring2.current) {
      ring2.current.rotation.x = Math.cos(t * 0.25) * 0.4 - 0.3
      ring2.current.rotation.z = t * 0.15
    }
    if (ring3.current) {
      ring3.current.rotation.y = Math.sin(t * 0.2) * 0.5
      ring3.current.rotation.z = -t * 0.1
    }

    // Smooth mouse follow with lerp
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mousePos.y * 0.25,
        0.04
      )
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mousePos.x * 0.25,
        0.04
      )
      // Gentle float
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.15
    }
  })

  return (
    <group ref={groupRef}>
      {/* Core sphere with custom shader */}
      <mesh>
        <icosahedronGeometry args={[1, 32]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe overlay for that holographic feel */}
      <mesh>
        <icosahedronGeometry args={[1.03, 4]} />
        <meshBasicMaterial
          color="#00f0ff"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.04}
        />
      </mesh>

      {/* Orbiting rings */}
      <mesh ref={ring1}>
        <torusGeometry args={[1.6, 0.008, 16, 128]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.35} />
      </mesh>

      <mesh ref={ring2}>
        <torusGeometry args={[1.9, 0.006, 16, 128]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.25} />
      </mesh>

      <mesh ref={ring3}>
        <torusGeometry args={[2.2, 0.004, 16, 128]} />
        <meshBasicMaterial color="#ff006e" transparent opacity={0.15} />
      </mesh>

      {/* Point light at the center for local illumination */}
      <pointLight color="#00f0ff" intensity={1.5} distance={5} decay={2} />
    </group>
  )
}
