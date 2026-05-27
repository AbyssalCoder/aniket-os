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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      })

      if (res.ok) {
        setTerminalOutput((prev) => [
          ...prev,
          { type: 'success', text: '✓ TRANSMISSION SENT — Email delivered successfully.' },
        ])
        setSubmitted(true)
      } else {
        // Server route failed — use mailto as fallback
        const subject = encodeURIComponent(`Portfolio Contact from ${formData.name}`)
        const body = encodeURIComponent(`From: ${formData.name} (${formData.email})\n\n${formData.message}`)
        window.location.href = `mailto:${personalInfo.email}?subject=${subject}&body=${body}`
        setTerminalOutput((prev) => [
          ...prev,
          { type: 'success', text: '✓ Opening your email client to send the message...' },
        ])
        setSubmitted(true)
      }
    } catch {
      // Network error — use mailto
      const subject = encodeURIComponent(`Portfolio Contact from ${formData.name}`)
      const body = encodeURIComponent(`From: ${formData.name} (${formData.email})\n\n${formData.message}`)
      window.location.href = `mailto:${personalInfo.email}?subject=${subject}&body=${body}`
      setTerminalOutput((prev) => [
        ...prev,
        { type: 'success', text: '✓ Opening your email client to send the message...' },
      ])
      setSubmitted(true)
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

          {/* Social icons */}
          <div className="flex items-center gap-5">
            {/* WhatsApp */}
            <a
              href={personalInfo.links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              title="WhatsApp"
            >
              <svg className="w-5 h-5 text-white/30 group-hover:text-[#25D366] transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            {/* Email */}
            <a
              href={`mailto:${personalInfo.email}`}
              className="group relative"
              title="Email"
            >
              <svg className="w-5 h-5 text-white/30 group-hover:text-cyber-cyan transition-colors duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href={personalInfo.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              title="LinkedIn"
            >
              <svg className="w-5 h-5 text-white/30 group-hover:text-[#0A66C2] transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            {/* GitHub */}
            <a
              href={personalInfo.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              title="GitHub"
            >
              <svg className="w-5 h-5 text-white/30 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </a>
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
