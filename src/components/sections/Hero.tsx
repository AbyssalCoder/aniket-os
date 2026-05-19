'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { personalInfo } from '@/data/resume'

/**
 * Hero — Full-screen cinematic intro.
 * The 3D orb renders behind via the fixed Scene canvas.
 * This section lays text on top with staggered reveals.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subtextRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 })

      // Name reveal — each character
      if (nameRef.current) {
        const chars = nameRef.current.querySelectorAll('.hero-char')
        tl.fromTo(
          chars,
          { opacity: 0, y: 60, rotateX: -90, filter: 'blur(6px)' },
          {
            opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)',
            stagger: 0.04, duration: 0.7, ease: 'power3.out',
          },
          0.3
        )
      }

      // Title line
      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, y: 20, width: 0 },
          { opacity: 1, y: 0, width: 'auto', duration: 0.8, ease: 'power2.out' },
          '-=0.3'
        )
      }

      // Subtext
      if (subtextRef.current) {
        tl.fromTo(
          subtextRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.4'
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  /* Split name into characters for stagger animation */
  const firstName = personalInfo.firstName
  const lastName = personalInfo.lastName

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
    >
      {/* Radial gradient underlay */}
      <div className="absolute inset-0 bg-gradient-radial from-cyber-cyan/[0.04] via-transparent to-transparent" />
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Content — centred on top of 3D canvas */}
      <div className="relative z-10 text-center px-6" style={{ perspective: '800px' }}>
        {/* Status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase">
            System Online — Neural Interface Active
          </span>
        </motion.div>

        {/* Name */}
        <h1
          ref={nameRef}
          className="font-orbitron text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[0.05em] mb-4 whitespace-nowrap"
        >
          {firstName.split('').map((c, i) => (
            <span
              key={`f-${i}`}
              className="hero-char inline-block text-white will-change-transform"
              style={{ transformOrigin: 'center bottom' }}
            >
              {c}
            </span>
          ))}
          <span className="inline-block">&nbsp;</span>
          {lastName.split('').map((c, i) => (
            <span
              key={`l-${i}`}
              className="hero-char inline-block text-cyber-cyan text-glow will-change-transform"
              style={{ transformOrigin: 'center bottom' }}
            >
              {c}
            </span>
          ))}
        </h1>

        {/* Title */}
        <div ref={titleRef} className="overflow-hidden mb-6">
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-cyber-cyan/50" />
            <span className="font-mono text-sm md:text-base tracking-[0.4em] text-cyber-cyan/70 uppercase">
              {personalInfo.title}
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-cyber-cyan/50" />
          </div>
        </div>

        {/* Tagline */}
        <p
          ref={subtextRef}
          className="font-inter text-sm md:text-base text-white/30 max-w-md mx-auto leading-relaxed"
        >
          Building intelligent systems that push the boundaries of what&apos;s possible.
        </p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault()
              document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="font-mono text-xs tracking-wider px-6 py-2.5 bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan rounded hover:bg-cyber-cyan/20 hover:border-cyber-cyan/50 transition-all duration-300"
          >
            VIEW PROJECTS
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault()
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="font-mono text-xs tracking-wider px-6 py-2.5 border border-white/10 text-white/50 rounded hover:border-white/20 hover:text-white/70 transition-all duration-300"
          >
            GET IN TOUCH
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[9px] tracking-[0.3em] text-white/20 uppercase">
          Scroll
        </span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-cyber-cyan/40 to-transparent animate-pulse" />
      </motion.div>

      {/* Edge vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,#050510_100%)]" />
    </section>
  )
}
