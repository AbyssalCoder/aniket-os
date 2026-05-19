'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface AnimatedTextProps {
  text: string
  className?: string
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  delay?: number
  stagger?: number
  scrollTrigger?: boolean
}

/**
 * AnimatedText — Splits text into individual characters and
 * staggers them in with GSAP. Optionally tied to ScrollTrigger
 * so the reveal happens when the text enters the viewport.
 */
export default function AnimatedText({
  text,
  className = '',
  tag: Tag = 'h2',
  delay = 0,
  stagger = 0.03,
  scrollTrigger = true,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chars = el.querySelectorAll('.anim-char')

    const tl = gsap.timeline({
      scrollTrigger: scrollTrigger
        ? {
            trigger: el,
            start: 'top 85%',
            once: true,
          }
        : undefined,
      delay,
    })

    tl.fromTo(
      chars,
      { opacity: 0, y: 40, rotateX: -90, filter: 'blur(4px)' },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        filter: 'blur(0px)',
        stagger,
        duration: 0.6,
        ease: 'power3.out',
      }
    )

    return () => {
      tl.kill()
    }
  }, [text, delay, stagger, scrollTrigger])

  /* Split text into words → chars, preserving spaces */
  const words = text.split(' ')

  return (
    <div ref={containerRef} style={{ perspective: '600px' }}>
      <Tag className={className} aria-label={text}>
        {words.map((word, wi) => (
          <span key={wi} className="inline-block whitespace-nowrap">
            {word.split('').map((char, ci) => (
              <span
                key={ci}
                className="anim-char inline-block will-change-transform"
                style={{ transformOrigin: 'center bottom' }}
              >
                {char}
              </span>
            ))}
            {wi < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        ))}
      </Tag>
    </div>
  )
}
