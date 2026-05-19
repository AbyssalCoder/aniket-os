'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * LoadingScreen — Cinematic futuristic boot sequence.
 * Shows a glitch-text initialisation, progress bar, and
 * system status lines before fading out.
 */

const bootLines = [
  '> Initializing Neural Interface...',
  '> Loading AI Core Systems...',
  '> Establishing Secure Connection...',
  '> Calibrating Visual Cortex...',
  '> Syncing Knowledge Graph...',
  '> System Online.',
]

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [currentLine, setCurrentLine] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  /* Typewriter effect for each boot line */
  useEffect(() => {
    if (currentLine >= bootLines.length) return

    const line = bootLines[currentLine]
    let charIdx = 0
    setDisplayedText('')

    intervalRef.current = setInterval(() => {
      charIdx++
      setDisplayedText(line.slice(0, charIdx))
      if (charIdx >= line.length) {
        clearInterval(intervalRef.current)
        setTimeout(() => setCurrentLine((p) => p + 1), 200)
      }
    }, 25)

    return () => clearInterval(intervalRef.current)
  }, [currentLine])

  /* Progress bar */
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer)
          return 100
        }
        return p + 1.5
      })
    }, 30)
    return () => clearInterval(timer)
  }, [])

  /* Trigger exit after progress completes */
  useEffect(() => {
    if (progress >= 100 && currentLine >= bootLines.length) {
      const exitTimer = setTimeout(onComplete, 600)
      return () => clearTimeout(exitTimer)
    }
  }, [progress, currentLine, onComplete])

  return (
    <motion.div
      key="loading"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-dark-950"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent animate-scan-line"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg px-8">
        {/* Logo / Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-orbitron text-3xl md:text-4xl tracking-[0.3em] text-cyber-cyan text-glow">
            ANIKET
          </h1>
          <div className="h-[1px] w-32 mx-auto mt-3 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent" />
          <p className="font-mono text-xs text-white/30 mt-3 tracking-widest">
            AI SYSTEMS v2.0
          </p>
        </motion.div>

        {/* Terminal output */}
        <div className="font-mono text-xs text-white/50 space-y-1 mb-8 min-h-[160px]">
          {bootLines.slice(0, currentLine).map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-cyber-cyan/60"
            >
              {line}
            </motion.p>
          ))}
          {currentLine < bootLines.length && (
            <p className="text-cyber-cyan">
              {displayedText}
              <span className="animate-flicker ml-0.5">▌</span>
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div className="flex justify-between font-mono text-[10px] text-white/30 mb-2">
            <span>LOADING SYSTEMS</span>
            <span>{Math.min(Math.round(progress), 100)}%</span>
          </div>
          <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-cyan"
              style={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          {/* Glow under progress bar */}
          <div
            className="absolute -bottom-2 left-0 h-4 bg-cyber-cyan/20 blur-xl rounded-full transition-all duration-100"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Corner decorations */}
      <CornerDeco className="top-6 left-6" />
      <CornerDeco className="top-6 right-6 rotate-90" />
      <CornerDeco className="bottom-6 left-6 -rotate-90" />
      <CornerDeco className="bottom-6 right-6 rotate-180" />
    </motion.div>
  )
}

function CornerDeco({ className }: { className: string }) {
  return (
    <div className={`absolute w-8 h-8 ${className}`}>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-cyber-cyan/30" />
      <div className="absolute top-0 left-0 w-[1px] h-full bg-cyber-cyan/30" />
    </div>
  )
}
