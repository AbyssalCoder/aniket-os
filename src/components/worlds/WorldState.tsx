'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type WorldType = 'none' | 'projects' | 'skills'

interface WorldState {
  activeWorld: WorldType
  transitioning: boolean
  enterWorld: (world: 'projects' | 'skills') => void
  exitWorld: () => void
  onTransitionComplete: () => void
  audioEnabled: boolean
  toggleAudio: () => void
}

const WorldContext = createContext<WorldState | null>(null)

export function useWorldState() {
  const ctx = useContext(WorldContext)
  if (!ctx) throw new Error('useWorldState must be inside WorldProvider')
  return ctx
}

export function WorldProvider({ children }: { children: ReactNode }) {
  const [activeWorld, setActiveWorld] = useState<WorldType>('none')
  const [transitioning, setTransitioning] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)

  const enterWorld = useCallback((world: 'projects' | 'skills') => {
    setTransitioning(true)
    // After transition animation completes, actually show the world
    setTimeout(() => {
      setActiveWorld(world)
      setTransitioning(false)
    }, 2000) // 2s transition
  }, [])

  const exitWorld = useCallback(() => {
    setTransitioning(true)
    setTimeout(() => {
      setActiveWorld('none')
      setTransitioning(false)
      // Release pointer lock
      if (document.pointerLockElement) {
        document.exitPointerLock()
      }
    }, 1000)
  }, [])

  const onTransitionComplete = useCallback(() => {
    setTransitioning(false)
  }, [])

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev)
  }, [])

  return (
    <WorldContext.Provider
      value={{
        activeWorld,
        transitioning,
        enterWorld,
        exitWorld,
        onTransitionComplete,
        audioEnabled,
        toggleAudio,
      }}
    >
      {children}
    </WorldContext.Provider>
  )
}
