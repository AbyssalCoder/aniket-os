'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FPSControlsProps {
  speed?: number
  sprintMultiplier?: number
  sensitivity?: number
  enabled?: boolean
  /** boundaries: [minX, maxX, minZ, maxZ] */
  bounds?: [number, number, number, number]
  onPositionChange?: (pos: THREE.Vector3) => void
}

/**
 * First-person controls with pointer lock, WASD/arrow movement, sprint.
 * Attach to a R3F Canvas. Movement is smooth with inertia.
 */
export default function FPSControls({
  speed = 5,
  sprintMultiplier = 1.8,
  sensitivity = 0.002,
  enabled = true,
  bounds,
  onPositionChange,
}: FPSControlsProps) {
  const { camera, gl } = useThree()
  const keys = useRef<Record<string, boolean>>({})
  const velocity = useRef(new THREE.Vector3())
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const isLocked = useRef(false)

  // Request pointer lock on click
  useEffect(() => {
    if (!enabled) return

    const canvas = gl.domElement

    const onClick = () => {
      canvas.requestPointerLock()
    }

    const onLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked.current) return
      euler.current.setFromQuaternion(camera.quaternion)
      euler.current.y -= e.movementX * sensitivity
      euler.current.x -= e.movementY * sensitivity
      euler.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.current.x))
      camera.quaternion.setFromEuler(euler.current)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true
      // Prevent default for movement keys
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault()
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false
    }

    canvas.addEventListener('click', onClick)
    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)

    return () => {
      canvas.removeEventListener('click', onClick)
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock()
      }
    }
  }, [camera, gl, sensitivity, enabled])

  // Reuse vectors to avoid GC
  const _forward = useRef(new THREE.Vector3())
  const _right = useRef(new THREE.Vector3())
  const _input = useRef(new THREE.Vector3())
  const _target = useRef(new THREE.Vector3())
  const _delta3 = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    if (!enabled || !isLocked.current) return

    const k = keys.current
    const sprint = k['ShiftLeft'] || k['ShiftRight'] ? sprintMultiplier : 1
    const moveSpeed = speed * sprint

    // Direction vectors (reuse)
    const forward = _forward.current
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = _right.current
    right.crossVectors(forward, camera.up).normalize()

    // Input (reuse)
    const input = _input.current.set(0, 0, 0)
    if (k['KeyW'] || k['ArrowUp']) input.add(forward)
    if (k['KeyS'] || k['ArrowDown']) input.sub(forward)
    if (k['KeyD'] || k['ArrowRight']) input.add(right)
    if (k['KeyA'] || k['ArrowLeft']) input.sub(right)

    if (input.length() > 0) input.normalize()

    // Smooth velocity with inertia
    const target = _target.current.copy(input).multiplyScalar(moveSpeed)
    velocity.current.lerp(target, 1 - Math.pow(0.001, delta))

    // Apply movement
    _delta3.current.copy(velocity.current).multiplyScalar(delta)
    camera.position.add(_delta3.current)

    // Keep camera at eye height
    camera.position.y = 1.7

    // Apply bounds
    if (bounds) {
      camera.position.x = Math.max(bounds[0], Math.min(bounds[1], camera.position.x))
      camera.position.z = Math.max(bounds[2], Math.min(bounds[3], camera.position.z))
    }

    // Report position
    if (onPositionChange) {
      onPositionChange(camera.position.clone())
    }
  })

  return null
}
