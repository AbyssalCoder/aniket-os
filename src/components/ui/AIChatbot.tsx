'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  role: 'user' | 'bot'
  text: string
}

/**
 * AIChatbot — Floating 3D-styled orb button that opens a chat panel
 * powered by Gemini API (via /api/chat server route).
 */
export default function AIChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "Hey! I'm NeuralBot — Aniket's AI assistant. Ask me anything about his projects, skills, or experience." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', text: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Build history for context (skip the first bot greeting)
      const history = messages.slice(1).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      })

      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: data.reply || data.error || 'Something went wrong.' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Connection lost. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating orb button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle AI chatbot"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #00f0ff33, #8b5cf620, #05051090)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.2), inset 0 0 20px rgba(0, 240, 255, 0.1)',
        }}
      >
        {/* Animated rings */}
        <div className="absolute inset-0 rounded-full border border-cyber-cyan/20 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-[-3px] rounded-full border border-cyber-purple/10 animate-spin-slow" />

        {/* Icon */}
        <span className="text-cyber-cyan text-xl relative z-10">
          {open ? '✕' : '⬡'}
        </span>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] max-h-[500px] rounded-xl overflow-hidden flex flex-col"
            style={{
              background: 'rgba(5, 5, 16, 0.95)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(0, 240, 255, 0.12)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 240, 255, 0.08)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-cyber-cyan/60 animate-pulse" />
              <span className="font-orbitron text-xs tracking-[0.15em] text-cyber-cyan">
                NEURALBOT
              </span>
              <span className="font-mono text-[9px] text-white/20 ml-auto">v2.0</span>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[350px]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-cyber-cyan/10 border border-cyber-cyan/20 text-white/70'
                        : 'bg-white/[0.03] border border-white/[0.06] text-white/50'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 border-t border-white/[0.06]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Aniket..."
                  className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/70 font-mono placeholder:text-white/20 focus:outline-none focus:border-cyber-cyan/30 transition-colors"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-3 py-2 rounded-lg border border-cyber-cyan/30 text-cyber-cyan text-xs hover:bg-cyber-cyan/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ⟫
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
