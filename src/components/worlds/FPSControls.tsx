'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** AABB wall: [minX, maxX, minZ, maxZ] */
export type WallBox = [number, number, number, number]

interface FPSControlsProps {
  speed?: number
  sprintMultiplier?: number
  sensitivity?: number
  enabled?: boolean
  /** boundaries: [minX, maxX, minZ, maxZ] */
  bounds?: [number, number, number, number]
  /** AABB wall collision boxes */
  walls?: WallBox[]
  /** Mobile joystick input ref: { mx, mz, cx, cy } */
  joystickRef?: React.MutableRefObject<{ mx: number; mz: number; cx: number; cy: number }>
  onPositionChange?: (pos: THREE.Vector3) => void
}

const PLAYER_RADIUS = 0.35

export default function FPSControls({
  speed = 5,
  sprintMultiplier = 1.8,
  sensitivity = 0.002,
  enabled = true,
  bounds,
  walls,
  joystickRef,
  onPositionChange,
}: FPSControlsProps) {
  const { camera, gl } = useThree()
  const keys = useRef<Record<string, boolean>>({})
  const velocity = useRef(new THREE.Vector3())
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const isLocked = useRef(false)
  const isMobile = useRef(false)

  useEffect(() => {
    isMobile.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }, [])

  // Request pointer lock on click (desktop only)
  useEffect(() => {
    if (!enabled) return

    const canvas = gl.domElement

    const onClick = () => {
      if (!isMobile.current) canvas.requestPointerLock()
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
    if (!enabled) return

    const hasMobileInput = isMobile.current && joystickRef?.current
    if (!isLocked.current && !hasMobileInput) return

    // Mobile camera rotation from joystick
    if (hasMobileInput) {
      const j = joystickRef!.current
      if (j.cx !== 0 || j.cy !== 0) {
        euler.current.setFromQuaternion(camera.quaternion)
        euler.current.y -= j.cx * sensitivity * 3
        euler.current.x -= j.cy * sensitivity * 3
        euler.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.current.x))
        camera.quaternion.setFromEuler(euler.current)
      }
    }

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

    // Mobile joystick movement input
    if (hasMobileInput) {
      const j = joystickRef!.current
      if (j.mx !== 0 || j.mz !== 0) {
        input.addScaledVector(forward, -j.mz)
        input.addScaledVector(right, j.mx)
      }
    }

    if (input.length() > 0) input.normalize()

    // Smooth velocity with inertia
    const target = _target.current.copy(input).multiplyScalar(moveSpeed)
    velocity.current.lerp(target, 1 - Math.pow(0.001, delta))

    // Apply movement
    _delta3.current.copy(velocity.current).multiplyScalar(delta)

    // Wall collision: resolve each axis independently
    if (walls && walls.length > 0) {
      const newX = camera.position.x + _delta3.current.x
      const newZ = camera.position.z + _delta3.current.z

      // Try X first
      let canX = true
      for (const w of walls) {
        if (
          newX + PLAYER_RADIUS > w[0] &&
          newX - PLAYER_RADIUS < w[1] &&
          camera.position.z + PLAYER_RADIUS > w[2] &&
          camera.position.z - PLAYER_RADIUS < w[3]
        ) {
          canX = false
          break
        }
      }

      // Try Z
      let canZ = true
      for (const w of walls) {
        if (
          camera.position.x + PLAYER_RADIUS > w[0] &&
          camera.position.x - PLAYER_RADIUS < w[1] &&
          newZ + PLAYER_RADIUS > w[2] &&
          newZ - PLAYER_RADIUS < w[3]
        ) {
          canZ = false
          break
        }
      }

      if (canX) camera.position.x = newX
      else velocity.current.x = 0

      if (canZ) camera.position.z = newZ
      else velocity.current.z = 0
    } else {
      camera.position.add(_delta3.current)
    }

    // Keep camera at eye height
    camera.position.y = 1.7

    // Apply bounds
    if (bounds) {
      camera.position.x = Math.max(bounds[0], Math.min(bounds[1], camera.position.x))
      camera.position.z = Math.max(bounds[2], Math.min(bounds[3], camera.position.z))
    }

    // Report position
    if (onPositionChange) {
      onPositionChange(camera.position)
    }
  })

  return null
}
