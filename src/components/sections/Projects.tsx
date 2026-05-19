'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionLabel } from './About'
import GlassCard from '@/components/ui/GlassCard'
import { projects, type Project } from '@/data/resume'

gsap.registerPlugin(ScrollTrigger)

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null)
  const [filter, setFilter] = useState<'all' | 'featured'>('all')

  const displayed = filter === 'featured'
    ? projects.filter((p) => p.featured)
    : projects

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.project-card').forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: i * 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              once: true,
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [filter])

  return (
    <section ref={sectionRef} id="projects" className="relative">
      <div className="max-w-6xl mx-auto">
        <SectionLabel label="03" title="PROJECTS" />

        {/* Filter toggle */}
        <div className="flex items-center gap-6 mt-6 mb-10">
          <FilterBtn
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label={`ALL (${projects.length})`}
          />
          <FilterBtn
            active={filter === 'featured'}
            onClick={() => setFilter('featured')}
            label={`FEATURED (${projects.filter((p) => p.featured).length})`}
          />
        </div>

        {/* Project grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {displayed.map((project, i) => (
              <motion.div
                key={project.title}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="project-card"
              >
                <ProjectCard project={project} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

/* ── Project Card ── */
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const colors = ['#00f0ff', '#8b5cf6', '#ff006e', '#0066ff', '#00ff88']
  const accent = colors[index % colors.length]
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <div
      className="group relative rounded-xl overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500"
      onMouseEnter={() => videoRef.current?.play()}
      onMouseLeave={() => {
        if (videoRef.current) {
          videoRef.current.pause()
          videoRef.current.currentTime = 0
        }
      }}
    >
      {/* Video preview on hover */}
      {project.video && (
        <div className="relative w-full aspect-video overflow-hidden bg-black/30">
          <video
            ref={videoRef}
            src={project.video}
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent" />
          {/* Play indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover:opacity-0 transition-opacity duration-300">
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
              <span className="text-white/40 text-xs ml-0.5">▶</span>
            </div>
          </div>
        </div>
      )}

      {/* Top gradient accent */}
      <div
        className="h-[2px] w-full opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {project.featured && (
              <span
                className="inline-block font-mono text-[9px] tracking-wider px-2 py-0.5 rounded-full mb-2"
                style={{
                  color: accent,
                  border: `1px solid ${accent}40`,
                  background: `${accent}10`,
                }}
              >
                FEATURED
              </span>
            )}
            <h3 className="font-orbitron text-sm md:text-base text-white/90 tracking-wide leading-tight">
              {project.title}
            </h3>
          </div>

          {/* Decorative corner */}
          <div className="w-8 h-8 border-t border-r opacity-20 group-hover:opacity-40 transition-opacity" style={{ borderColor: accent }} />
        </div>

        {/* Description */}
        <p className="text-white/30 text-xs leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tech.map((t) => (
            <span
              key={t}
              className="font-mono text-[9px] tracking-wider px-2 py-1 rounded bg-white/[0.04] text-white/35 border border-white/[0.04]"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Links */}
        {project.links && (
          <div className="flex gap-3 pt-3 border-t border-white/[0.04]">
            {project.links.live && (
              <ProjectLink href={project.links.live} label="LIVE" accent={accent} />
            )}
            {project.links.github && (
              <ProjectLink href={project.links.github} label="GITHUB" accent={accent} />
            )}
            {project.links.backend && (
              <ProjectLink href={project.links.backend} label="API" accent={accent} />
            )}
          </div>
        )}
      </div>

      {/* Hover glow */}
      <div
        className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700"
        style={{ background: accent }}
      />
    </div>
  )
}

function ProjectLink({ href, label, accent }: { href: string; label: string; accent: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-[10px] tracking-wider px-3 py-1 rounded border transition-all duration-300 hover:shadow-lg"
      style={{
        color: `${accent}aa`,
        borderColor: `${accent}30`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${accent}60`
        e.currentTarget.style.background = `${accent}15`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${accent}30`
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {label} ↗
    </a>
  )
}

function FilterBtn({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-[10px] tracking-wider px-4 py-1.5 rounded border transition-all duration-300 ${
        active
          ? 'border-cyber-cyan/50 text-cyber-cyan bg-cyber-cyan/10'
          : 'border-white/10 text-white/30 hover:text-white/50 hover:border-white/20'
      }`}
    >
      {label}
    </button>
  )
}
