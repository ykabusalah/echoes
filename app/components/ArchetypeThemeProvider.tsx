'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Archetype = 'wanderer' | 'guardian' | 'seeker' | 'flame' | 'dreamer' | 'shadow' | 'jackal' | null

const archetypeHSL: Record<string, { light: string; dark: string }> = {
  wanderer: { 
    light: '217 91% 60%',
    dark: '217 91% 70%' 
  },
  guardian: { 
    light: '142 71% 45%',
    dark: '142 71% 55%' 
  },
  seeker: { 
    light: '262 83% 58%',
    dark: '262 83% 68%' 
  },
  flame: { 
    light: '24 95% 53%',
    dark: '24 95% 63%' 
  },
  dreamer: { 
    light: '330 81% 60%',
    dark: '330 81% 70%' 
  },
  shadow: { 
    light: '240 10% 45%',
    dark: '240 10% 60%' 
  },
  jackal: {
    light: '32 85% 38%',
    dark: '32 85% 50%'
  }
}

interface ArchetypeContextType {
  archetype: Archetype
  setArchetype: (archetype: Archetype) => void
  isLoading: boolean
}

const ArchetypeContext = createContext<ArchetypeContextType>({
  archetype: null,
  setArchetype: () => {},
  isLoading: true
})

export function useArchetype() {
  return useContext(ArchetypeContext)
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  return document.cookie.split('; ').find(row => row.startsWith('visitorId='))?.split('=')[1] || ''
}

function applyArchetypeTheme(archetype: string) {
  const colors = archetypeHSL[archetype]
  if (!colors) return

  const root = document.documentElement
  const isDark = root.classList.contains('dark')
  root.style.setProperty('--brand', isDark ? colors.dark : colors.light)
}

export function ArchetypeThemeProvider({ children }: { children: ReactNode }) {
  const [archetype, setArchetypeState] = useState<Archetype>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchArchetype() {
      const visitorId = getVisitorId()
      if (!visitorId) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/quiz?visitorId=${visitorId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.hasProfile && data.profile?.archetype) {
            const arch = data.profile.archetype.toLowerCase()
            setArchetypeState(arch as Archetype)
            applyArchetypeTheme(arch)
          }
        }
      } catch (error) {
        console.error('Failed to fetch archetype:', error)
      }
      setIsLoading(false)
    }

    fetchArchetype()
  }, [])

  useEffect(() => {
    if (!archetype) return

    applyArchetypeTheme(archetype)

    const root = document.documentElement
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          applyArchetypeTheme(archetype)
        }
      })
    })

    observer.observe(root, { attributes: true })

    return () => observer.disconnect()
  }, [archetype])

  const setArchetype = (newArchetype: Archetype) => {
    setArchetypeState(newArchetype)
    if (newArchetype) {
      applyArchetypeTheme(newArchetype)
    }
  }

  return (
    <ArchetypeContext.Provider value={{ archetype, setArchetype, isLoading }}>
      {children}
    </ArchetypeContext.Provider>
  )
}