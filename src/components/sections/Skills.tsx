'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { SectionLabel } from './About'
import { skillCategories } from '@/data/resume'
import { useWorldState } from '@/components/worlds/WorldState'

gsap.registerPlugin(ScrollTrigger)

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null)
  const { enterWorld } = useWorldState()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger in each skill category card
      gsap.utils.toArray<HTMLElement>('.skill-category').forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            delay: i * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              once: true,
            },
          }
        )
      })

      // Animate individual skill pills
      gsap.utils.toArray<HTMLElement>('.skill-pill').forEach((pill, i) => {
        gsap.fromTo(
          pill,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            delay: 0.02 * i,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: pill.closest('.skill-category'),
              start: 'top 80%',
              once: true,
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="skills" className="relative">
      <div className="max-w-6xl mx-auto">
        <SectionLabel label="02" title="SKILLS" />

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-white/25 text-sm max-w-lg mt-4 mb-12"
        >
          Core technologies and tools powering my AI/ML engineering workflow.
        </motion.p>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => enterWorld('skills')}
            className="font-orbitron text-xs sm:text-sm tracking-[0.2em] px-6 py-2.5 rounded-lg border-2 border-cyber-cyan/50 text-cyber-cyan bg-cyber-cyan/5 hover:bg-cyber-cyan/15 hover:border-cyber-cyan hover:text-cyan-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300 group animate-pulse"
          >
            <span className="inline-block group-hover:rotate-90 transition-transform duration-300">⬡</span> EXPLORE IN 3D
          </button>
        </div>

        {/* Skills grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((cat) => (
            <div
              key={cat.id}
              className="skill-category relative rounded-xl overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6 group hover:border-white/[0.12] transition-all duration-500"
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)`,
                }}
              />

              {/* Category header */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-lg">{cat.icon}</span>
                <h3
                  className="font-orbitron text-sm tracking-wider font-semibold"
                  style={{ color: cat.color }}
                >
                  {cat.label}
                </h3>
                <span className="font-mono text-[9px] text-white/20 ml-auto">
                  {cat.items.length}
                </span>
              </div>

              {/* Skill pills */}
              <div className="flex flex-wrap gap-2">
                {cat.items.map((skill) => (
                  <span
                    key={skill}
                    className="skill-pill font-mono text-[10px] tracking-wider px-3 py-1.5 rounded-full border text-white/50 hover:text-white/80 transition-all duration-300 cursor-default"
                    style={{
                      borderColor: `${cat.color}20`,
                      background: `${cat.color}08`,
                    }}
                    onMouseEnter={(e) => {
                      const t = e.currentTarget
                      t.style.borderColor = `${cat.color}50`
                      t.style.background = `${cat.color}15`
                      t.style.boxShadow = `0 0 15px ${cat.color}20`
                    }}
                    onMouseLeave={(e) => {
                      const t = e.currentTarget
                      t.style.borderColor = `${cat.color}20`
                      t.style.background = `${cat.color}08`
                      t.style.boxShadow = 'none'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Background pulse on hover */}
              <div
                className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-[0.06] transition-opacity duration-700"
                style={{ background: cat.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
