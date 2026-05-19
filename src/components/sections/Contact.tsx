'use client'

import { useRef, useState, useEffect, FormEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { SectionLabel } from './About'
import { personalInfo, languages } from '@/data/resume'

gsap.registerPlugin(ScrollTrigger)

const terminalLines = [
  { type: 'system', text: 'ANIKET_OS v2.0 — Communication Terminal' },
  { type: 'system', text: '————————————————————————————————' },
  { type: 'info', text: 'Type your message below to establish connection.' },
  { type: 'info', text: 'All channels are encrypted and monitored by AI.' },
]

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState(terminalLines)
  const [terminalInput, setTerminalInput] = useState('')
  const termScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (termScrollRef.current) {
      termScrollRef.current.scrollTop = termScrollRef.current.scrollHeight
    }
  }, [terminalOutput])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-terminal',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-terminal',
            start: 'top 85%',
            once: true,
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    setTerminalOutput((prev) => [
      ...prev,
      { type: 'input', text: `> Sending transmission from ${formData.name}...` },
    ])

    try {
      const res = await fetch('https://formsubmit.co/ajax/aniketsupermails2005@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: `Portfolio Contact from ${formData.name}`,
        }),
      })

      if (res.ok) {
        setTerminalOutput((prev) => [
          ...prev,
          { type: 'success', text: '✓ TRANSMISSION SENT — Email delivered successfully.' },
        ])
        setSubmitted(true)
      } else {
        throw new Error('Failed')
      }
    } catch {
      setTerminalOutput((prev) => [
        ...prev,
        { type: 'info', text: '✗ Transmission failed. Opening fallback channel...' },
      ])
      const subject = encodeURIComponent(`Portfolio Contact from ${formData.name}`)
      const body = encodeURIComponent(formData.message)
      window.open(`mailto:${personalInfo.email}?subject=${subject}&body=${body}`)
    } finally {
      setSending(false)
    }
  }

  const handleTerminalCommand = (e: FormEvent) => {
    e.preventDefault()
    const cmd = terminalInput.trim().toLowerCase()
    if (!cmd) return
    setTerminalInput('')

    const responses: Record<string, { type: string; text: string }[]> = {
      help: [
        { type: 'system', text: 'Available commands:' },
        { type: 'info', text: '  help     — Show this menu' },
        { type: 'info', text: '  about    — Who is Aniket?' },
        { type: 'info', text: '  skills   — Technical skills' },
        { type: 'info', text: '  projects — Featured projects' },
        { type: 'info', text: '  contact  — Contact info' },
        { type: 'info', text: '  social   — Social links' },
        { type: 'info', text: '  clear    — Clear terminal' },
      ],
      about: [
        { type: 'system', text: `${personalInfo.name}` },
        { type: 'info', text: personalInfo.summary.slice(0, 200) + '...' },
      ],
      skills: [
        { type: 'system', text: 'Core Skills:' },
        { type: 'info', text: '  AI/ML • Deep Learning • Computer Vision • NLP' },
        { type: 'info', text: '  Python • TypeScript • React • Next.js • Node.js' },
        { type: 'info', text: '  Firebase • MongoDB • Docker • Git' },
      ],
      projects: [
        { type: 'system', text: 'Featured Projects:' },
        { type: 'info', text: '  → CodeAbyss — AI Cloud IDE' },
        { type: 'info', text: '  → MedMate — AI Healthcare Assistant' },
        { type: 'info', text: '  → AI-Based Intrusion Detection System' },
        { type: 'info', text: '  → Live Waste Classifier (YOLOv8)' },
      ],
      contact: [
        { type: 'system', text: 'Contact Info:' },
        { type: 'info', text: `  Email: ${personalInfo.email}` },
        { type: 'info', text: `  Phone: ${personalInfo.phone}` },
        { type: 'info', text: `  Location: ${personalInfo.location}` },
      ],
      social: [
        { type: 'system', text: 'Social Links:' },
        { type: 'info', text: `  GitHub: ${personalInfo.links.github}` },
        { type: 'info', text: `  LinkedIn: ${personalInfo.links.linkedin}` },
      ],
    }

    if (cmd === 'clear') {
      setTerminalOutput(terminalLines)
      return
    }

    const output = responses[cmd]
    setTerminalOutput((prev) => [
      ...prev,
      { type: 'input', text: `$ ${cmd}` },
      ...(output || [{ type: 'info', text: `Command not found: "${cmd}". Type "help" for commands.` }]),
    ])
  }

  return (
    <section ref={sectionRef} id="contact" className="relative pb-20">
      <div className="max-w-6xl mx-auto">
        <SectionLabel label="06" title="CONTACT" />

        <div className="grid lg:grid-cols-2 gap-8 mt-12">
          {/* Left — Terminal */}
          <div className="contact-terminal relative rounded-xl overflow-hidden bg-dark-950 border border-white/[0.06]">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="font-mono text-[10px] text-white/20 ml-3 tracking-wider">
                comm_terminal — aniket@neural-net
              </span>
            </div>

            {/* Terminal body */}
            <div ref={termScrollRef} className="p-5 font-mono text-xs space-y-1.5 min-h-[240px] max-h-[300px] overflow-y-auto">
              {terminalOutput.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={
                    line.type === 'system'
                      ? 'text-cyber-cyan/60'
                      : line.type === 'info'
                      ? 'text-white/30'
                      : line.type === 'success'
                      ? 'text-emerald-400/80'
                      : 'text-cyber-purple/60'
                  }
                >
                  {line.text}
                </motion.p>
              ))}
            </div>

            {/* Interactive input */}
            <form onSubmit={handleTerminalCommand} className="px-5 pb-4">
              <div className="flex items-center gap-2 border-t border-white/[0.06] pt-3">
                <span className="text-cyber-cyan/50 text-xs">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder='type "help" for commands'
                  className="flex-1 bg-transparent text-xs text-white/50 font-mono placeholder:text-white/15 focus:outline-none"
                />
                <span className="text-cyber-cyan animate-flicker">▌</span>
              </div>
            </form>

            {/* Scan line */}
            <div className="absolute inset-0 pointer-events-none scan-overlay" />
          </div>

          {/* Right — Contact form */}
          <div className="relative rounded-xl overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-6 md:p-8">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="font-mono text-[10px] tracking-wider text-white/30 uppercase block mb-2">
                    Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 font-mono placeholder:text-white/15 focus:outline-none focus:border-cyber-cyan/30 transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] tracking-wider text-white/30 uppercase block mb-2">
                    Comm Channel
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 font-mono placeholder:text-white/15 focus:outline-none focus:border-cyber-cyan/30 transition-colors"
                    placeholder="email@domain.com"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] tracking-wider text-white/30 uppercase block mb-2">
                    Transmission
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 font-mono placeholder:text-white/15 focus:outline-none focus:border-cyber-cyan/30 transition-colors resize-none"
                    placeholder="Your message..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full font-mono text-xs tracking-[0.2em] px-6 py-3 bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan rounded-lg hover:bg-cyber-cyan/20 hover:border-cyber-cyan/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all duration-300 uppercase disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sending ? '⟫ Transmitting...' : '⟫ Execute Transmission'}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <div className="w-16 h-16 rounded-full border-2 border-emerald-400/50 flex items-center justify-center mb-4">
                  <span className="text-2xl text-emerald-400">✓</span>
                </div>
                <p className="font-orbitron text-sm text-white/70 tracking-wider mb-2">
                  TRANSMISSION SENT
                </p>
                <p className="font-mono text-xs text-white/30">
                  Response incoming via neural link...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick links footer */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/[0.04]">
          {/* Contact info */}
          <div className="flex flex-wrap items-center gap-6">
            <a
              href={`mailto:${personalInfo.email}`}
              className="font-mono text-xs text-white/30 hover:text-cyber-cyan transition-colors"
            >
              {personalInfo.email}
            </a>
            <span className="text-white/10">|</span>
            <a
              href={`tel:${personalInfo.phone}`}
              className="font-mono text-xs text-white/30 hover:text-cyber-cyan transition-colors"
            >
              {personalInfo.phone}
            </a>
            <span className="text-white/10">|</span>
            <span className="font-mono text-xs text-white/20">
              {personalInfo.location}
            </span>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {Object.entries(personalInfo.links)
              .filter(([key]) => key !== 'boldProfile')
              .map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] tracking-wider text-white/25 hover:text-cyber-cyan transition-colors uppercase"
              >
                {key}
              </a>
            ))}
          </div>

          {/* Languages */}
          <div className="flex items-center gap-3">
            {languages.map((lang) => (
              <span
                key={lang.name}
                className="font-mono text-[9px] text-white/15 tracking-wider"
                title={`${lang.name}: ${lang.level}`}
              >
                {lang.name.slice(0, 3).toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-10">
          <p className="font-mono text-[10px] text-white/10 tracking-wider">
            © {new Date().getFullYear()} ANIKET CHOWDHURY — ENGINEERED WITH PRECISION
          </p>
        </div>
      </div>
    </section>
  )
}
