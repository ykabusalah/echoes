import { useEffect, useRef, useCallback } from 'react'

interface UseSceneTrackingProps {
  sessionId: string | null
  sceneId: string | null
  enabled?: boolean
}

export function useSceneTracking({ sessionId, sceneId, enabled = true }: UseSceneTrackingProps) {
  const viewIdRef = useRef<string | null>(null)
  const lastSceneRef = useRef<string | null>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const trackEnter = useCallback(async () => {
    if (!sessionId || !sceneId || !enabled) return

    try {
      const res = await fetch('/api/track/scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, sceneId, action: 'enter' })
      })
      const data = await res.json()
      viewIdRef.current = data.viewId
    } catch (e) {
      console.error('Track enter failed:', e)
    }
  }, [sessionId, sceneId, enabled])

  const trackExit = useCallback(async () => {
    if (!viewIdRef.current || !enabled) return

    try {
      await fetch('/api/track/scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          sceneId: lastSceneRef.current,
          action: 'exit',
          viewId: viewIdRef.current
        })
      })
      viewIdRef.current = null
    } catch (e) {
      console.error('Track exit failed:', e)
    }
  }, [sessionId, enabled])

  const trackInteraction = useCallback(async (eventType: string, metadata?: object) => {
    if (!sessionId || !sceneId || !enabled) return

    try {
      await fetch('/api/track/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, sceneId, eventType, metadata })
      })
    } catch (e) {
      console.error('Track interaction failed:', e)
    }
  }, [sessionId, sceneId, enabled])

  // Handle scene changes
  useEffect(() => {
    if (!sceneId || sceneId === lastSceneRef.current) return

    if (lastSceneRef.current) trackExit()

    lastSceneRef.current = sceneId
    trackEnter()

    return () => { trackExit() }
  }, [sceneId, trackEnter, trackExit])

  // Track choice hover (hesitation)
  const onChoiceHover = useCallback((choiceId: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)

    hoverTimeoutRef.current = setTimeout(() => {
      trackInteraction('hover_choice', { choiceId, duration: 2000 })
    }, 2000)
  }, [trackInteraction])

  const onChoiceLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }, [])

  // Track scroll for reread detection
  const onScroll = useCallback((scrollDirection: 'up' | 'down', scrollDepth: number) => {
    if (scrollDirection === 'up' && scrollDepth < 50) {
      trackInteraction('reread', { scrollDepth })
    }
  }, [trackInteraction])

  // Idle detection
  useEffect(() => {
    if (!enabled) return

    const resetIdle = () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)

      idleTimeoutRef.current = setTimeout(() => {
        trackInteraction('idle_return', { idleDuration: 30000 })
      }, 30000)
    }

    window.addEventListener('mousemove', resetIdle)
    window.addEventListener('keydown', resetIdle)
    window.addEventListener('scroll', resetIdle)

    return () => {
      window.removeEventListener('mousemove', resetIdle)
      window.removeEventListener('keydown', resetIdle)
      window.removeEventListener('scroll', resetIdle)
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)
    }
  }, [enabled, trackInteraction])

  return { onChoiceHover, onChoiceLeave, onScroll, trackInteraction }
}