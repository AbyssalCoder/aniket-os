'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { SectionLabel } from './About'
import { experiences, certifications } from '@/data/resume'

gsap.registerPlugin(ScrollTrigger)

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate timeline items
      gsap.utils.toArray<HTMLElement>('.timeline-item').forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, x: i % 2 === 0 ? -40 : 40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              once: true,
            },
          }
        )
      })

      // Grow the timeline line
      const line = document.querySelector('.timeline-line') as HTMLElement
      if (line) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              end: 'bottom 80%',
              scrub: 1,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="experience" className="relative">
      <div className="max-w-6xl mx-auto">
        <SectionLabel label="04" title="EXPERIENCE" />

        <div className="mt-12 relative">
          {/* Central timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] md:-translate-x-[0.5px]">
            <div className="timeline-line w-full h-full bg-gradient-to-b from-cyber-cyan/40 via-cyber-purple/30 to-cyber-pink/20 origin-top" />
          </div>

          {/* Timeline items */}
          <div className="space-y-12">
            {experiences.map((exp, i) => (
              <div
                key={i}
                className={`timeline-item relative flex flex-col md:flex-row ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } items-start gap-8`}
              >
                {/* Dot on timeline */}
                <div className="absolute left-4 md:left-1/2 top-2 w-3 h-3 -translate-x-1/2 rounded-full border-2 border-cyber-cyan/60 bg-dark-900 z-10">
                  <div className="absolute inset-0 rounded-full bg-cyber-cyan/30 animate-ping" />
                </div>

                {/* Content card */}
                <div
                  className={`ml-12 md:ml-0 md:w-[45%] ${
                    i % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                  }`}
                >
                  <div className="relative rounded-xl overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6 group hover:border-white/[0.1] transition-all duration-500">
                    {/* Type badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`font-mono text-[9px] tracking-wider px-2 py-0.5 rounded-full border ${
                          exp.type === 'internship'
                            ? 'text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/10'
                            : 'text-cyber-purple border-cyber-purple/30 bg-cyber-purple/10'
                        }`}
                      >
                        {exp.type === 'internship' ? 'INTERNSHIP' : 'EXPERIENCE'}
                      </span>
                      <span className="font-mono text-[9px] text-white/20 ml-auto">
                        {exp.date}
                      </span>
                    </div>

                    <h3 className="font-orbitron text-sm tracking-wider text-white/90 mb-1">
                      {exp.title}
                    </h3>
                    <p className="font-mono text-xs text-cyber-cyan/50 mb-4">{exp.company}</p>

                    <ul className="space-y-2">
                      {exp.bullets.map((bullet, bi) => (
                        <li key={bi} className="flex gap-2 text-xs text-white/30 leading-relaxed">
                          <span className="text-cyber-cyan/40 mt-1 shrink-0">▸</span>
                          {bullet}
                        </li>
                      ))}
                    </ul>

                    {/* Hover glow */}
                    <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-2xl bg-cyber-cyan/0 group-hover:bg-cyber-cyan/[0.05] transition-all duration-700" />
                  </div>
                </div>

                {/* Spacer for the other side */}
                <div className="hidden md:block md:w-[45%]" />
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-24">
          <SectionLabel label="05" title="CERTIFICATIONS" />

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {certifications.map((cert, i) => (
              <motion.div
                key={cert}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
                className="relative rounded-lg bg-white/[0.015] border border-white/[0.05] p-4 hover:border-cyber-purple/20 transition-all duration-300 group"
              >
                <div className="flex gap-3 items-start">
                  <span className="text-cyber-purple/50 text-sm mt-0.5 group-hover:text-cyber-purple transition-colors">
                    ◆
                  </span>
                  <p className="text-xs text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                    {cert}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
