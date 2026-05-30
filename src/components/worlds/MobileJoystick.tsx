'use client'

import { useRef, useCallback, useEffect } from 'react'

interface MobileJoystickProps {
  joystickRef: React.MutableRefObject<{ mx: number; mz: number; cx: number; cy: number }>
}

const STICK_SIZE = 120
const KNOB_SIZE = 48
const MAX_DIST = (STICK_SIZE - KNOB_SIZE) / 2

export default function MobileJoystick({ joystickRef }: MobileJoystickProps) {
  const leftKnobRef = useRef<HTMLDivElement>(null)
  const rightKnobRef = useRef<HTMLDivElement>(null)
  const leftTouchId = useRef<number | null>(null)
  const rightTouchId = useRef<number | null>(null)
  const leftOrigin = useRef({ x: 0, y: 0 })
  const rightOrigin = useRef({ x: 0, y: 0 })

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val))

  const handleTouchStart = useCallback((e: React.TouchEvent, side: 'left' | 'right') => {
    e.preventDefault()
    const touch = e.changedTouches[0]
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    if (side === 'left') {
      leftTouchId.current = touch.identifier
      leftOrigin.current = { x: cx, y: cy }
    } else {
      rightTouchId.current = touch.identifier
      rightOrigin.current = { x: cx, y: cy }
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent, side: 'left' | 'right') => {
    e.preventDefault()
    const id = side === 'left' ? leftTouchId.current : rightTouchId.current
    if (id === null) return

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier !== id) continue

      const origin = side === 'left' ? leftOrigin.current : rightOrigin.current
      let dx = touch.clientX - origin.x
      let dy = touch.clientY - origin.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > MAX_DIST) {
        dx = (dx / dist) * MAX_DIST
        dy = (dy / dist) * MAX_DIST
      }

      const nx = dx / MAX_DIST
      const ny = dy / MAX_DIST

      const knob = side === 'left' ? leftKnobRef.current : rightKnobRef.current
      if (knob) {
        knob.style.transform = `translate(${dx}px, ${dy}px)`
      }

      if (side === 'left') {
        joystickRef.current.mx = nx
        joystickRef.current.mz = ny
      } else {
        joystickRef.current.cx = nx
        joystickRef.current.cy = ny
      }
    }
  }, [joystickRef])

  const handleTouchEnd = useCallback((e: React.TouchEvent, side: 'left' | 'right') => {
    e.preventDefault()
    const id = side === 'left' ? leftTouchId.current : rightTouchId.current
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === id) {
        const knob = side === 'left' ? leftKnobRef.current : rightKnobRef.current
        if (knob) knob.style.transform = 'translate(0px, 0px)'
        if (side === 'left') {
          leftTouchId.current = null
          joystickRef.current.mx = 0
          joystickRef.current.mz = 0
        } else {
          rightTouchId.current = null
          joystickRef.current.cx = 0
          joystickRef.current.cy = 0
        }
      }
    }
  }, [joystickRef])

  return (
    <>
      {/* Left joystick — movement */}
      <div
        className="fixed z-50 touch-none"
        style={{ bottom: 40, left: 30, width: STICK_SIZE, height: STICK_SIZE }}
        onTouchStart={(e) => handleTouchStart(e, 'left')}
        onTouchMove={(e) => handleTouchMove(e, 'left')}
        onTouchEnd={(e) => handleTouchEnd(e, 'left')}
        onTouchCancel={(e) => handleTouchEnd(e, 'left')}
      >
        <div
          className="absolute inset-0 rounded-full border-2 border-white/20 bg-white/5"
        />
        <div
          ref={leftKnobRef}
          className="absolute rounded-full bg-white/30 border border-white/40"
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            top: (STICK_SIZE - KNOB_SIZE) / 2,
            left: (STICK_SIZE - KNOB_SIZE) / 2,
            transition: 'none',
          }}
        />
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-white/30 uppercase tracking-wider">Move</span>
      </div>

      {/* Right joystick — camera look */}
      <div
        className="fixed z-50 touch-none"
        style={{ bottom: 40, right: 30, width: STICK_SIZE, height: STICK_SIZE }}
        onTouchStart={(e) => handleTouchStart(e, 'right')}
        onTouchMove={(e) => handleTouchMove(e, 'right')}
        onTouchEnd={(e) => handleTouchEnd(e, 'right')}
        onTouchCancel={(e) => handleTouchEnd(e, 'right')}
      >
        <div
          className="absolute inset-0 rounded-full border-2 border-white/20 bg-white/5"
        />
        <div
          ref={rightKnobRef}
          className="absolute rounded-full bg-white/30 border border-white/40"
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            top: (STICK_SIZE - KNOB_SIZE) / 2,
            left: (STICK_SIZE - KNOB_SIZE) / 2,
            transition: 'none',
          }}
        />
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-white/30 uppercase tracking-wider">Look</span>
      </div>
    </>
  )
}
