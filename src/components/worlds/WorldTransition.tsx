'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useWorldState, type WorldType } from './WorldState'

export default function WorldTransition() {
  const { transitioning, activeWorld } = useWorldState()

  return (
    <AnimatePresence>
      {transitioning && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Full-screen black overlay */}
          <motion.div
            className="absolute inset-0 bg-dark-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Door / portal animation */}
          <DoorAnimation target={activeWorld} />

          {/* Loading HUD */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="w-16 h-16 relative">
              {/* Spinning ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent"
                style={{
                  borderTopColor: activeWorld === 'projects' ? '#ff006e' : '#00f0ff',
                  borderRightColor: activeWorld === 'projects' ? '#ff006e40' : '#00f0ff40',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border border-transparent"
                style={{
                  borderBottomColor: '#8b5cf6',
                  borderLeftColor: '#8b5cf640',
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            <motion.p
              className="font-orbitron text-xs tracking-[0.3em] text-white/60"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {activeWorld === 'none' ? 'RETURNING' : 'ENTERING DIMENSION'}
            </motion.p>

            {/* Scan line effect */}
            <motion.div
              className="w-48 h-[1px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${
                  activeWorld === 'projects' ? '#ff006e' : '#00f0ff'
                }, transparent)`,
              }}
              animate={{ scaleX: [0, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function DoorAnimation({ target }: { target: WorldType }) {
  const color = target === 'projects' ? '#ff006e' : '#00f0ff'

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Left door panel */}
      <motion.div
        className="absolute top-0 left-0 w-1/2 h-full"
        style={{ background: `linear-gradient(90deg, #030308, ${color}10)` }}
        initial={{ x: 0 }}
        animate={{ x: '-100%' }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
      >
        <div
          className="absolute right-0 top-0 w-[2px] h-full opacity-80"
          style={{ background: color }}
        />
        {/* Door panel lines */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute right-8 h-[1px] opacity-20"
            style={{
              top: `${12 + i * 10}%`,
              width: `${30 + Math.random() * 40}%`,
              background: color,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
          />
        ))}
      </motion.div>

      {/* Right door panel */}
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-full"
        style={{ background: `linear-gradient(270deg, #030308, ${color}10)` }}
        initial={{ x: 0 }}
        animate={{ x: '100%' }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
      >
        <div
          className="absolute left-0 top-0 w-[2px] h-full opacity-80"
          style={{ background: color }}
        />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-8 h-[1px] opacity-20"
            style={{
              top: `${12 + i * 10}%`,
              width: `${30 + Math.random() * 40}%`,
              background: color,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
          />
        ))}
      </motion.div>

      {/* Center light burst */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ width: 2, height: '100%', opacity: 1 }}
        animate={{ width: '200vw', opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
        style={{ background: `radial-gradient(ellipse, ${color}40, transparent 70%)` }}
      />

      {/* Grid distortion lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        {[...Array(20)].map((_, i) => (
          <motion.line
            key={`h${i}`}
            x1="0" y1={`${i * 5}%`} x2="100%" y2={`${i * 5}%`}
            stroke={color}
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: i * 0.02 }}
          />
        ))}
        {[...Array(30)].map((_, i) => (
          <motion.line
            key={`v${i}`}
            x1={`${i * 3.33}%`} y1="0" x2={`${i * 3.33}%`} y2="100%"
            stroke={color}
            strokeWidth="0.3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.01 }}
          />
        ))}
      </svg>
    </div>
  )
}
