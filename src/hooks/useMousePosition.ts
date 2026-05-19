'use client'

import { useState, useEffect, useCallback } from 'react'

interface MousePosition {
  x: number   // -1 → 1 (normalised)
  y: number   // -1 → 1 (normalised)
  px: number  // pixel x
  py: number  // pixel y
}

export default function useMousePosition(): MousePosition {
  const [pos, setPos] = useState<MousePosition>({ x: 0, y: 0, px: 0, py: 0 })

  const handleMove = useCallback((e: MouseEvent) => {
    setPos({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
      px: e.clientX,
      py: e.clientY,
    })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [handleMove])

  return pos
}
