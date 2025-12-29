'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type Character = {
  id: string
  name: string
  description: string | null
  avatarUrl: string | null
}

type Choice = {
  id: string
  text: string
  toSceneId: string
}

type Scene = {
  id: string
  title: string
  content: string
  isEnding: boolean
  character: Character | null
  choicesFrom: Choice[]
}

type Story = {
  id: string
  title: string
  description: string | null
  scenes: Scene[]
}

type ChoiceStats = {
  totalVotes: number
  chosenId: string
  stats: { id: string; text: string; count: number; percentage: number }[]
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  let id = document.cookie.split('; ').find(row => row.startsWith('visitorId='))?.split('=')[1]
  if (!id) {
    id = crypto.randomUUID()
    document.cookie = `visitorId=${id}; max-age=31536000; path=/`
  }
  return id
}

function FloatingOrb({ className, style }: { className: string; style: React.CSSProperties }) {
  return <div className={`orb ${className}`} style={style} />
}

function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const indexRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setDisplayed('')
    setIsComplete(false)
    indexRef.current = 0
    
    intervalRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        setIsComplete(true)
        onComplete?.()
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, 20)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [text, onComplete])

  const handleSkip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setDisplayed(text)
    setIsComplete(true)
    onComplete?.()
  }

  return (
    <div className="relative">
      <div 
        onClick={!isComplete ? handleSkip : undefined}
        className={!isComplete ? 'cursor-pointer' : ''}
      >
        <p className="scene-content whitespace-pre-line">
          {displayed}
          {!isComplete && <span className="inline-block w-0.5 h-6 bg-[--gold-mid] ml-1 animate-pulse" />}
        </p>
      </div>
      
      {!isComplete && (
        <button
          onClick={handleSkip}
          className="mt-6 mx-auto block px-4 py-2 text-sm text-[--text-muted] hover:text-[--gold-mid] 
            border border-[--purple-mid]/50 hover:border-[--gold-mid]/50 rounded-full
            transition-all duration-300 flex items-center gap-2"
          style={{ fontFamily: "'Spectral', serif" }}
        >
          <span>Skip</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}
      
      {!isComplete && (
        <p className="text-center text-xs text-[--text-muted]/50 mt-2">
          or click text to skip
        </p>
      )}
    </div>
  )
}

export default function PlayStory() {
  const params = useParams()
  const storyId = params.storyId as string

  const [story, setStory] = useState<Story | null>(null)
  const [currentScene, setCurrentScene] = useState<Scene | null>(null)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<Scene[]>([])
  const [visitorId, setVisitorId] = useState<string>('')
  const [showChoices, setShowChoices] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [choiceStats, setChoiceStats] = useState<ChoiceStats | null>(null)
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    setVisitorId(getVisitorId())
  }, [])

  useEffect(() => {
    async function fetchStory() {
      const res = await fetch(`/api/stories/${storyId}`)
      if (res.ok) {
        const data = await res.json()
        setStory(data)
        if (data.scenes && data.scenes.length > 0) {
          const startScene = data.scenes[0]
          setCurrentScene(startScene)
          setShowChoices(false)
          
          if (visitorId) {
            fetch('/api/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                storyId,
                visitorId,
                sceneId: startScene.id,
                isEnding: startScene.isEnding
              })
            })
          }
        }
      }
      setLoading(false)
    }
    if (visitorId) fetchStory()
  }, [storyId, visitorId])

  async function handleChoice(choice: Choice) {
    setTransitioning(true)
    setShowChoices(false)
    setShowStats(false)
    setChoiceStats(null)
    
    if (currentScene) {
      setHistory([...history, currentScene])
    }

    // Track the choice first
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyId,
        visitorId,
        choiceId: choice.id,
        sceneId: choice.toSceneId,
        isEnding: false
      })
    })

    // Fetch stats for this choice
    const statsRes = await fetch(`/api/choices/${choice.id}/stats`)
    if (statsRes.ok) {
      const stats = await statsRes.json()
      setChoiceStats(stats)
      setShowStats(true)
    }

    // Wait to show stats
    await new Promise(resolve => setTimeout(resolve, 2500))
    setShowStats(false)

    await new Promise(resolve => setTimeout(resolve, 400))

    const res = await fetch(`/api/scenes/${choice.toSceneId}`)
    if (res.ok) {
      const scene = await res.json()
      setCurrentScene(scene)

      if (scene.isEnding) {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyId,
            visitorId,
            sceneId: scene.id,
            isEnding: true
          })
        })
      }
    }
    
    setTransitioning(false)
  }

  function handleRestart() {
    if (story && story.scenes.length > 0) {
      const startScene = story.scenes[0]
      setCurrentScene(startScene)
      setHistory([])
      setShowChoices(false)

      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          visitorId,
          sceneId: startScene.id,
          isEnding: startScene.isEnding
        })
      })
    }
  }

  if (loading && !currentScene) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[--purple-mid] border-t-[--gold-mid] rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-[--purple-bright] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-[--text-muted] animate-pulse" style={{ fontFamily: "'Spectral', serif", fontStyle: 'italic' }}>
          Opening the pages...
        </p>
      </div>
    )
  }

  if (!story || !currentScene) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="text-6xl">📖</div>
        <h1 className="text-3xl text-[--gold-mid]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Story Not Found
        </h1>
        <p className="text-[--text-muted]" style={{ fontFamily: "'Spectral', serif" }}>
          This tale seems to have vanished into the mist...
        </p>
        <Link href="/" className="btn btn-primary">
          Return to Library
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 relative">
      {/* Floating orbs */}
      <FloatingOrb 
        className="orb-purple animate-float-slow" 
        style={{ width: '300px', height: '300px', top: '10%', left: '5%', opacity: 0.25 }} 
      />
      <FloatingOrb 
        className="orb-gold animate-float" 
        style={{ width: '200px', height: '200px', bottom: '20%', right: '5%', opacity: 0.2, animationDelay: '2s' }} 
      />

      {/* Stats overlay */}
      {showStats && choiceStats && (
        <div className="fixed inset-0 bg-[--purple-darkest]/90 flex items-center justify-center z-50 animate-fade-in">
          <div className="max-w-md w-full mx-4 text-center">
            <p className="text-[--text-muted] mb-6 text-sm uppercase tracking-widest">
              {choiceStats.totalVotes} reader{choiceStats.totalVotes !== 1 ? 's' : ''} chose
            </p>
            
            <div className="space-y-4">
              {choiceStats.stats.map(stat => (
                <div 
                  key={stat.id}
                  className={`p-4 rounded-lg border ${
                    stat.id === choiceStats.chosenId 
                      ? 'border-[--gold-mid] bg-[--gold-mid]/10' 
                      : 'border-[--purple-mid]/50 bg-[--purple-dark]/30'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm text-left flex-1 mr-4 ${
                      stat.id === choiceStats.chosenId ? 'text-[--gold-light]' : 'text-[--text-secondary]'
                    }`} style={{ fontFamily: "'Spectral', serif" }}>
                      {stat.text}
                    </span>
                    <span className={`text-lg font-bold ${
                      stat.id === choiceStats.chosenId ? 'text-[--gold-mid]' : 'text-[--purple-glow]'
                    }`}>
                      {stat.percentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-[--purple-darkest] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        stat.id === choiceStats.chosenId 
                          ? 'bg-gradient-to-r from-[--gold-dark] to-[--gold-mid]' 
                          : 'bg-gradient-to-r from-[--purple-mid] to-[--purple-bright]'
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {choiceStats.chosenId && (
              <p className="mt-6 text-[--gold-light]" style={{ fontFamily: "'Spectral', serif", fontStyle: 'italic' }}>
                ✦ You chose with {choiceStats.stats.find(s => s.id === choiceStats.chosenId)?.percentage}% of readers ✦
              </p>
            )}
          </div>
        </div>
      )}

      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Link 
            href="/" 
            className="text-[--text-muted] hover:text-[--gold-mid] transition-colors flex items-center gap-2 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm" style={{ fontFamily: "'Spectral', serif" }}>Leave</span>
          </Link>
          
          <h1 className="text-xl md:text-2xl text-gradient text-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {story.title}
          </h1>
          
          <div className="w-16" />
        </header>

        {/* Progress bar */}
        <div className="progress-bar mb-10">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${Math.min(((history.length + 1) / 10) * 100, 100)}%` }} 
          />
        </div>

        {/* Scene card */}
        <div 
          className={`card p-8 md:p-12 mb-8 transition-all duration-500 ${
            transitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {/* Chapter indicator */}
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1 rounded-full text-xs tracking-[0.2em] uppercase
              bg-gradient-to-r from-[--purple-dark]/80 to-[--purple-mid]/80 
              border border-[--purple-light]/50 text-[--purple-glow]">
              Scene {history.length + 1}
            </span>
          </div>

          {/* Character badge */}
          {currentScene.character && (
            <div className="mb-8 animate-fade-in">
              <span className="character-badge">
                {currentScene.character.name}
              </span>
            </div>
          )}

          {/* Scene content with typewriter */}
          <div className="mb-12">
            <TypewriterText 
              key={currentScene.id}
              text={currentScene.content} 
              onComplete={() => setShowChoices(true)}
            />
          </div>

          {/* Choices or ending */}
          {currentScene.isEnding ? (
            <div className="ending-card animate-scale-in">
              <div className="mb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[--gold-mid] to-[--purple-bright] flex items-center justify-center animate-pulse-glow">
                    <svg className="w-10 h-10 text-[--purple-darkest]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                </div>
                <p className="ending-title">The End</p>
                <p className="text-[--text-secondary] mt-2" style={{ fontFamily: "'Spectral', serif", fontStyle: 'italic' }}>
                  "{currentScene.title}"
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={handleRestart} className="btn btn-primary">
                  ↺ Begin Again
                </button>
                <Link href="/" className="btn btn-secondary text-center">
                  Choose Another Tale
                </Link>
              </div>
            </div>
          ) : (
            <div 
              className={`space-y-4 transition-all duration-700 ${
                showChoices ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
              }`}
            >
              <div className="divider max-w-xs mx-auto mb-6">
                <span className="text-[--text-muted] text-sm" style={{ fontFamily: "'Spectral', serif", fontStyle: 'italic' }}>
                  What will you do?
                </span>
              </div>
              {currentScene.choicesFrom.map((choice, index) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  disabled={!showChoices}
                  className="choice-btn animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.15}s`, opacity: 0 }}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Decorative footer element */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-[--text-muted]">
            <span className="w-8 h-px bg-gradient-to-r from-transparent to-[--purple-mid]" />
            <svg className="w-4 h-4 text-[--purple-light]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span className="w-8 h-px bg-gradient-to-l from-transparent to-[--purple-mid]" />
          </div>
        </div>
      </div>
    </div>
  )
}