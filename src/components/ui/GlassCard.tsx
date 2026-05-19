'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: ReactNode
  className?: string
  holo?: boolean      // Enable animated holographic border
  hover?: boolean     // Enable hover lift effect
  delay?: number
}

/**
 * GlassCard — Glassmorphism card with optional holographic
 * animated border and hover physics.
 */
export default function GlassCard({
  children,
  className = '',
  holo = false,
  hover = true,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay, ease: [0.25, 1, 0.5, 1] }}
      whileHover={
        hover
          ? {
              y: -6,
              transition: { duration: 0.3, ease: 'easeOut' },
            }
          : undefined
      }
      className={`
        relative rounded-xl overflow-hidden
        bg-white/[0.02] backdrop-blur-xl
        border border-white/[0.06]
        ${holo ? 'holo-border' : ''}
        ${className}
      `}
    >
      {/* Inner glow at top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.8%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E')] pointer-events-none" />
    </motion.div>
  )
}
