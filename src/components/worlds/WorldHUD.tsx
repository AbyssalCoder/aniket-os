'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorldState } from './WorldState'

interface HUDProps {
  worldName: string
  accentColor: string
  discovered: number
  total: number
  itemLabel: string
  position?: { x: number; z: number }
  markers?: Array<{ x: number; z: number; found: boolean; label: string }>
  showCrosshair?: boolean
}

export default function WorldHUD({
  worldName,
  accentColor,
  discovered,
  total,
  itemLabel,
  position = { x: 0, z: 0 },
  markers = [],
  showCrosshair = true,
}: HUDProps) {
  const { exitWorld, audioEnabled, toggleAudio } = useWorldState()
  const [showHelp, setShowHelp] = useState(true)
  const [lastDiscovered, setLastDiscovered] = useState(0)
  const [flash, setFlash] = useState(false)

  // Auto-hide help after 5s
  useEffect(() => {
    const t = setTimeout(() => setShowHelp(false), 5000)
    return () => clearTimeout(t)
  }, [])

  // Flash on new discovery
  useEffect(() => {
    if (discovered > lastDiscovered && lastDiscovered > 0) {
      setFlash(true)
      setTimeout(() => setFlash(false), 800)
    }
    setLastDiscovered(discovered)
  }, [discovered, lastDiscovered])

  // ESC to exit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Only exit if pointer is not locked (second ESC press)
        if (!document.pointerLockElement) {
          exitWorld()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [exitWorld])

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Discovery flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse, ${accentColor}20, transparent 70%)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* Crosshair */}
      {showCrosshair && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-2" style={{ background: `${accentColor}60` }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-2" style={{ background: `${accentColor}60` }} />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-[1px]" style={{ background: `${accentColor}60` }} />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-[1px]" style={{ background: `${accentColor}60` }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full" style={{ background: `${accentColor}40` }} />
          </div>
        </div>
      )}

      {/* Top-left: World name + tracker */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: accentColor }} />
          <span className="font-orbitron text-xs tracking-[0.3em]" style={{ color: accentColor }}>
            {worldName}
          </span>
        </div>
        <div className="mt-3 font-mono text-sm">
          <span style={{ color: accentColor }}>{discovered}</span>
          <span className="text-white/30">/{total}</span>
          <span className="text-white/20 text-xs ml-2">{itemLabel} FOUND</span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: accentColor }}
            initial={{ width: 0 }}
            animate={{ width: `${(discovered / total) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Top-right: Controls */}
      <div className="absolute top-6 right-6 flex items-center gap-3 pointer-events-auto">
        {/* Audio toggle */}
        <button
          onClick={toggleAudio}
          className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:border-white/30 transition-all text-xs font-mono"
          title={audioEnabled ? 'Mute' : 'Unmute'}
        >
          {audioEnabled ? '🔊' : '🔇'}
        </button>

        {/* Exit */}
        <button
          onClick={exitWorld}
          className="font-mono text-[10px] tracking-wider px-3 py-1.5 rounded border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30 transition-all"
        >
          EXIT [ESC]
        </button>
      </div>

      {/* Mini-map / Radar */}
      <div className="absolute bottom-6 right-6">
        <div className="w-32 h-32 rounded-full border border-white/10 bg-black/50 backdrop-blur-sm relative overflow-hidden">
          {/* Grid */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-0 right-0 h-[1px]" style={{ background: accentColor }} />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px]" style={{ background: accentColor }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border" style={{ borderColor: `${accentColor}30` }} />
          </div>

          {/* Player dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: accentColor }}>
            <div className="absolute inset-0 rounded-full animate-ping" style={{ background: `${accentColor}40` }} />
          </div>

          {/* Marker dots */}
          {markers.map((m, i) => {
            const dx = (m.x - position.x) / 60 // scale
            const dz = (m.z - position.z) / 60
            const clampedX = Math.max(-0.45, Math.min(0.45, dx))
            const clampedZ = Math.max(-0.45, Math.min(0.45, dz))
            return (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: m.found ? '#00ff88' : `${accentColor}80`,
                  left: `${50 + clampedX * 100}%`,
                  top: `${50 + clampedZ * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )
          })}

          {/* Sweep line */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-16 h-[1px] origin-left"
            style={{ background: `linear-gradient(90deg, ${accentColor}60, transparent)` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />

          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-[7px] text-white/30">
            RADAR
          </div>
        </div>
      </div>

      {/* Bottom-left: Coordinates */}
      <div className="absolute bottom-6 left-6 font-mono text-[10px] text-white/20">
        <div>X: {position.x.toFixed(1)}</div>
        <div>Z: {position.z.toFixed(1)}</div>
      </div>

      {/* Center bottom: Click to explore hint */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p className="font-mono text-xs text-white/40 mb-1">CLICK TO LOOK AROUND</p>
            <p className="font-mono text-[10px] text-white/25">WASD TO MOVE · SHIFT TO SPRINT · ESC TO EXIT</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan lines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(transparent 50%, rgba(0,240,255,0.05) 50%)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t border-l opacity-20" style={{ borderColor: accentColor }} />
      <div className="absolute top-4 right-4 w-6 h-6 border-t border-r opacity-20" style={{ borderColor: accentColor }} />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l opacity-20" style={{ borderColor: accentColor }} />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r opacity-20" style={{ borderColor: accentColor }} />
    </div>
  )
}
