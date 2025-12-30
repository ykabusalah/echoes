'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '../../components/ThemeToggle'

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

type SessionSummary = {
  storyTitle: string
  endingTitle: string
  endingPercentage: number
  totalCompletions: number
  choices: {
    sceneTitle: string
    choiceText: string
    percentage: number
    totalVotes: number
  }[]
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

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L13.09 8.26L22 9.27L14 14.14L15.18 21.02L12 17.77L8.82 21.02L10 14.14L2 9.27L10.91 8.26L12 2Z" />
    </svg>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
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
        <p className="text-base leading-relaxed whitespace-pre-line">
          {displayed}
          {!isComplete && <span className="inline-block w-0.5 h-5 bg-[hsl(var(--brand))] ml-1 animate-pulse" />}
        </p>
      </div>
      
      {!isComplete && (
        <button
          onClick={handleSkip}
          className="mt-6 mx-auto block px-4 py-2 text-sm text-[hsl(var(--secondary-foreground))] 
            hover:text-[hsl(var(--foreground))] border border-[hsl(var(--border))] 
            hover:border-[hsl(var(--foreground)/0.3)] rounded-md transition-all duration-200"
        >
          Skip →
        </button>
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
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [summary, setSummary] = useState<SessionSummary | null>(null)

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
            }).then(res => res.json()).then(data => {
              setSessionId(data.sessionId)
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

    const statsRes = await fetch(`/api/choices/${choice.id}/stats`)
    if (statsRes.ok) {
      const stats = await statsRes.json()
      setChoiceStats(stats)
      setShowStats(true)
    }

    await new Promise(resolve => setTimeout(resolve, 2500))
    setShowStats(false)

    await new Promise(resolve => setTimeout(resolve, 400))

    const res = await fetch(`/api/scenes/${choice.toSceneId}`)
    if (res.ok) {
      const scene = await res.json()
      setCurrentScene(scene)

      if (scene.isEnding) {
        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyId,
            visitorId,
            sceneId: scene.id,
            isEnding: true
          })
        })

        if (sessionId) {
          setTimeout(async () => {
            const summaryRes = await fetch(`/api/sessions/${sessionId}/summary`)
            if (summaryRes.ok) {
              const summaryData = await summaryRes.json()
              setSummary(summaryData)
            }
          }, 1000)
        }
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
      setSummary(null)

      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          visitorId,
          sceneId: startScene.id,
          isEnding: startScene.isEnding
        })
      }).then(res => res.json()).then(data => {
        setSessionId(data.sessionId)
      })
    }
  }

  // Loading state
  if (loading && !currentScene) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="spinner" />
        <p className="text-sm text-[hsl(var(--secondary-foreground))]">
          Loading story...
        </p>
      </div>
    )
  }

  // Not found state
  if (!story || !currentScene) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <span className="text-5xl">📖</span>
        <h1 className="text-2xl font-semibold">Story Not Found</h1>
        <p className="text-sm text-[hsl(var(--secondary-foreground))]">
          This tale seems to have vanished...
        </p>
        <Link href="/" className="btn btn-primary">
          Return Home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav Bar */}
      <nav className="border-b border-[hsl(var(--border))]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
            Leave
          </Link>
          <span className="font-medium truncate mx-4">{story.title}</span>
          <ThemeToggle />
        </div>
      </nav>

      {/* Stats overlay */}
      {showStats && choiceStats && (
        <div className="fixed inset-0 bg-[hsl(var(--background))]/95 flex items-center justify-center z-50 animate-fade-in">
          <div className="max-w-md w-full mx-4 text-center">
            <p className="text-[hsl(var(--secondary-foreground))] mb-6 text-sm uppercase tracking-widest">
              {choiceStats.totalVotes} reader{choiceStats.totalVotes !== 1 ? 's' : ''} chose
            </p>
            
            <div className="space-y-3">
              {choiceStats.stats.map(stat => (
                <div 
                  key={stat.id}
                  className={`card p-4 ${
                    stat.id === choiceStats.chosenId 
                      ? 'border-[hsl(var(--brand))]' 
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-left flex-1 mr-4">
                      {stat.text}
                    </span>
                    <span className={`text-lg font-semibold ${
                      stat.id === choiceStats.chosenId ? 'text-[hsl(var(--brand))]' : ''
                    }`}>
                      {stat.percentage}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {choiceStats.chosenId && (
              <p className="mt-6 text-sm text-[hsl(var(--brand))]">
                ✦ You chose with {choiceStats.stats.find(s => s.id === choiceStats.chosenId)?.percentage}% of readers
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main content - centered */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-[hsl(var(--secondary-foreground))] mb-2">
              <span>Scene {history.length + 1}</span>
              <span>{Math.min(Math.round(((history.length + 1) / 10) * 100), 100)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.min(((history.length + 1) / 10) * 100, 100)}%` }} 
              />
            </div>
          </div>

          {/* Scene card */}
          <div 
            className={`card p-6 md:p-8 transition-all duration-300 ${
              transitioning ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
            }`}
          >
            {/* Character badge */}
            {currentScene.character && (
              <div className="mb-6">
                <span className="badge badge-brand">
                  {currentScene.character.name}
                </span>
              </div>
            )}

            {/* Scene content */}
            <div className="mb-8">
              <TypewriterText 
                key={currentScene.id}
                text={currentScene.content} 
                onComplete={() => setShowChoices(true)}
              />
            </div>

            {/* Choices or ending */}
            {currentScene.isEnding ? (
              <div className="text-center animate-fade-in">
                <div className="mb-6">
                  <SparkleIcon className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--brand))]" />
                  <h2 className="text-2xl font-semibold mb-2">The End</h2>
                  <p className="text-sm text-[hsl(var(--secondary-foreground))]">
                    "{currentScene.title}"
                  </p>
                  {summary && (
                    <p className="text-sm text-[hsl(var(--brand))] mt-2">
                      {summary.endingPercentage}% of readers reached this ending
                    </p>
                  )}
                </div>

                {/* Journey Summary */}
                {summary && summary.choices.length > 0 && (
                  <div className="mb-6 p-4 rounded-md bg-[hsl(var(--accent))] border border-[hsl(var(--border))] text-left">
                    <h3 className="text-sm font-medium mb-3 text-center">Your Journey</h3>
                    <div className="space-y-2">
                      {summary.choices.map((choice, index) => (
                        <div key={index} className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-[hsl(var(--secondary-foreground))] truncate flex-1">
                            {choice.choiceText}
                          </span>
                          <span className={`font-medium whitespace-nowrap ${
                            choice.percentage > 50 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--brand))]'
                          }`}>
                            {choice.percentage}% agreed
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] text-center">
                      <p className="text-xs text-[hsl(var(--secondary-foreground))]">
                        Based on {summary.totalCompletions} completed {summary.totalCompletions === 1 ? 'journey' : 'journeys'}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handleRestart} className="btn btn-brand">
                    ↺ Begin Again
                  </button>
                  <Link href="/" className="btn btn-secondary">
                    Choose Another Story
                  </Link>
                </div>
              </div>
            ) : (
              <div 
                className={`space-y-3 transition-all duration-500 ${
                  showChoices ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
              >
                <div className="divider mb-4">
                  <span>What will you do?</span>
                </div>
                {currentScene.choicesFrom.map((choice, index) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice)}
                    disabled={!showChoices}
                    className="choice-btn animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}