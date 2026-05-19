'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import AnimatedText from '@/components/ui/AnimatedText'
import GlassCard from '@/components/ui/GlassCard'
import { personalInfo, stats, education } from '@/data/resume'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate stats counters
      gsap.utils.toArray<HTMLElement>('.stat-value').forEach((el) => {
        const target = el.getAttribute('data-value') || '0'
        const numericPart = parseInt(target.replace(/\D/g, ''), 10)
        const suffix = target.replace(/[0-9]/g, '')

        gsap.fromTo(
          el,
          { textContent: '0' },
          {
            textContent: numericPart,
            duration: 2,
            ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true,
            },
            onUpdate: function () {
              el.textContent = Math.round(parseFloat(el.textContent || '0')) + suffix
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="about" className="relative">
      {/* Section label */}
      <div className="max-w-6xl mx-auto">
        <SectionLabel label="01" title="ABOUT" />

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Left — Bio */}
          <GlassCard className="p-8" holo delay={0.1}>
            {/* Profile image */}
            {personalInfo.profileImage && (
              <div className="flex justify-center mb-6">
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-cyber-cyan/20 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
                  <Image
                    src={personalInfo.profileImage}
                    alt={personalInfo.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
              </div>
            )}
            <AnimatedText
              text="Who I Am"
              tag="h3"
              className="font-orbitron text-xl md:text-2xl text-white mb-4 tracking-wide"
            />
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              {personalInfo.summary}
            </p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(personalInfo.links)
                .filter(([key]) => key !== 'boldProfile')
                .map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] tracking-wider px-3 py-1.5 border border-white/10 text-white/40 rounded hover:border-cyber-cyan/40 hover:text-cyber-cyan transition-all duration-300 uppercase"
                >
                  {key}
                </a>
              ))}
            </div>
          </GlassCard>

          {/* Right — Stats + Education */}
          <div className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <GlassCard key={stat.label} className="p-5 text-center" delay={0.15 + i * 0.08}>
                  <div
                    className="stat-value font-orbitron text-2xl md:text-3xl text-cyber-cyan text-glow mb-1"
                    data-value={stat.value}
                  >
                    0
                  </div>
                  <div className="font-mono text-[10px] tracking-wider text-white/30 uppercase">
                    {stat.label}
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Education */}
            <GlassCard className="p-6" delay={0.4}>
              <h4 className="font-orbitron text-xs tracking-[0.2em] text-cyber-purple mb-4 uppercase">
                Education
              </h4>
              {education.map((edu, i) => (
                <div key={i} className={`${i > 0 ? 'mt-4 pt-4 border-t border-white/5' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-white/80">{edu.degree}</p>
                      <p className="text-xs text-white/30 mt-0.5">{edu.institution}</p>
                      <p className="text-xs text-white/20 mt-0.5">{edu.gpa}</p>
                    </div>
                    <span className="font-mono text-[10px] text-cyber-cyan/50 shrink-0 ml-3">
                      {edu.date}
                    </span>
                  </div>
                </div>
              ))}
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Reusable section label */
export function SectionLabel({ label, title }: { label: string; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex items-center gap-4"
    >
      <span className="font-mono text-xs text-cyber-cyan/40 tracking-widest">{label}</span>
      <div className="h-[1px] w-12 bg-cyber-cyan/20" />
      <h2 className="font-orbitron text-xs tracking-[0.3em] text-white/40 uppercase">
        {title}
      </h2>
    </motion.div>
  )
}
