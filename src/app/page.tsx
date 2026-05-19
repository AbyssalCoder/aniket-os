'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'

import LoadingScreen from '@/components/ui/LoadingScreen'
import Navbar from '@/components/ui/Navbar'
import SmoothScroll from '@/components/layout/SmoothScroll'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Skills from '@/components/sections/Skills'
import Projects from '@/components/sections/Projects'
import Experience from '@/components/sections/Experience'
import Contact from '@/components/sections/Contact'
import AIChatbot from '@/components/ui/AIChatbot'

/* Load Three.js scene only on client — no SSR */
const Scene = dynamic(() => import('@/components/three/Scene'), { ssr: false })

export default function Home() {
  const [loaded, setLoaded] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const mainRef = useRef<HTMLDivElement>(null)

  /* Track normalised mouse position (-1 to 1) */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return (
    <>
      {/* ── Loading cinematic ── */}
      <AnimatePresence mode="wait">
        {!loaded && (
          <LoadingScreen key="loader" onComplete={() => setLoaded(true)} />
        )}
      </AnimatePresence>

      {/* ── Main site (hidden until loaded) ── */}
      <div
        ref={mainRef}
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.8s ease',
          pointerEvents: loaded ? 'auto' : 'none',
        }}
      >
        {/* Fixed 3D canvas background */}
        <Scene mousePos={mousePos} />

        {/* Cursor glow that follows mouse */}
        <div
          className="cursor-glow hidden lg:block"
          style={{
            left: `${((mousePos.x + 1) / 2) * 100}%`,
            top: `${((-mousePos.y + 1) / 2) * 100}%`,
          }}
        />

        <SmoothScroll>
          <Navbar />
          <main>
            <Hero />
            <About />
            <Skills />
            <Projects />
            <Experience />
            <Contact />
          </main>
        </SmoothScroll>

        {/* Floating AI chatbot */}
        <AIChatbot />
      </div>
    </>
  )
}
