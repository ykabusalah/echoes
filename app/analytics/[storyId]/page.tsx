'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type SessionStats = {
  total_sessions: number
  completed_sessions: number
  completion_rate: number
}

type ChoiceData = {
  choice_id: string
  choice_text: string
  from_scene: string
  times_chosen: number
  percentage: number
}

type DropOffData = {
  scene_id: string
  scene_title: string
  sessions_reached: number
  sessions_left: number
  drop_off_rate: number
}

type EndingData = {
  scene_id: string
  scene_title: string
  times_reached: number
  percentage: number
}

type Analytics = {
  sessionStats: SessionStats
  choicePopularity: ChoiceData[]
  dropOffPoints: DropOffData[]
  endingsReached: EndingData[]
}

function FloatingOrb({ className, style }: { className: string; style: React.CSSProperties }) {
  return <div className={`orb ${className}`} style={style} />
}

export default function AnalyticsDashboard() {
  const params = useParams()
  const storyId = params.storyId as string

  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      const res = await fetch(`/api/analytics/${storyId}`)
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
      setLoading(false)
    }
    fetchAnalytics()
  }, [storyId])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[--purple-mid] border-t-[--gold-mid] rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-[--purple-bright] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-[--text-muted] animate-pulse" style={{ fontFamily: "'Spectral', serif" }}>Gathering insights...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="text-6xl">📊</div>
        <h1 className="text-2xl text-[--gold-mid]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Failed to Load Analytics</h1>
        <Link href="/" className="btn btn-secondary">
          Return Home
        </Link>
      </div>
    )
  }

  const { sessionStats, choicePopularity, dropOffPoints, endingsReached } = analytics

  // Group choices by scene
  const choicesByScene = choicePopularity.reduce((acc, choice) => {
    if (!acc[choice.from_scene]) acc[choice.from_scene] = []
    acc[choice.from_scene].push(choice)
    return acc
  }, {} as Record<string, ChoiceData[]>)

  return (
    <div className="min-h-screen relative py-8 px-4">
      {/* Floating orbs */}
      <FloatingOrb 
        className="orb-purple animate-float-slow" 
        style={{ width: '350px', height: '350px', top: '10%', left: '5%', opacity: 0.3 }} 
      />
      <FloatingOrb 
        className="orb-gold animate-float" 
        style={{ width: '250px', height: '250px', bottom: '20%', right: '10%', opacity: 0.25, animationDelay: '2s' }} 
      />
      <FloatingOrb 
        className="orb-teal animate-float-slow" 
        style={{ width: '200px', height: '200px', top: '50%', right: '5%', opacity: 0.2, animationDelay: '3s' }} 
      />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
          <Link 
            href="/" 
            className="text-[--text-muted] hover:text-[--gold-mid] transition-colors flex items-center gap-2 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span style={{ fontFamily: "'Spectral', serif" }}>Back to Stories</span>
          </Link>
          
          <div className="text-center">
            <span className="inline-block px-4 py-1 rounded-full text-xs tracking-[0.2em] uppercase mb-2
              bg-gradient-to-r from-[--purple-dark]/80 to-[--purple-mid]/80 
              border border-[--purple-light]/50 text-[--purple-glow]">
              Story Analytics
            </span>
            <h1 className="text-3xl md:text-4xl text-gradient" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Reader Insights
            </h1>
          </div>
          
          <div className="w-32 hidden md:block" />
        </header>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="card p-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[--purple-mid] to-[--purple-dark] flex items-center justify-center">
              <svg className="w-8 h-8 text-[--purple-glow]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <p className="text-5xl font-semibold text-[--gold-light] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {sessionStats.total_sessions}
            </p>
            <p className="text-[--text-muted] uppercase tracking-wider text-sm">Total Journeys</p>
          </div>

          <div className="card p-8 text-center animate-fade-in-up stagger-1">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[--gold-dark] to-[--gold-mid] flex items-center justify-center">
              <svg className="w-8 h-8 text-[--purple-darkest]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-5xl font-semibold text-[--gold-light] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {sessionStats.completed_sessions}
            </p>
            <p className="text-[--text-muted] uppercase tracking-wider text-sm">Completed</p>
          </div>

          <div className="card p-8 text-center animate-fade-in-up stagger-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[--teal-glow]/30 to-[--purple-mid] flex items-center justify-center">
              <svg className="w-8 h-8 text-[--teal-glow]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-5xl font-semibold text-[--teal-glow] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {sessionStats.completion_rate || 0}%
            </p>
            <p className="text-[--text-muted] uppercase tracking-wider text-sm">Completion Rate</p>
          </div>
        </div>

        {/* Divider */}
        <div className="divider max-w-md mx-auto mb-16">
          <svg className="w-6 h-6 text-[--gold-mid]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>

        {/* Choice Popularity */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl text-[--text-primary] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              <span className="text-[--gold-light]">Choice</span> Popularity
            </h2>
            <p className="text-[--text-muted]" style={{ fontFamily: "'Spectral', serif", fontStyle: 'italic' }}>
              Which paths do readers choose most often?
            </p>
          </div>

          <div className="space-y-8">
            {Object.entries(choicesByScene).map(([sceneName, choices], idx) => (
              <div key={sceneName} className="card p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}>
                <h3 className="text-[--gold-mid] text-lg mb-6 flex items-center gap-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  <span className="w-2 h-2 rounded-full bg-[--gold-mid]" />
                  {sceneName}
                </h3>
                <div className="space-y-5">
                  {choices.map((choice) => (
                    <div key={choice.choice_id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[--text-primary] truncate mr-4" style={{ fontFamily: "'Spectral', serif" }}>
                          {choice.choice_text}
                        </span>
                        <span className="text-[--purple-glow] whitespace-nowrap font-medium">
                          {choice.times_chosen} <span className="text-[--text-muted]">({choice.percentage || 0}%)</span>
                        </span>
                      </div>
                      <div className="h-3 bg-[--purple-darker] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${choice.percentage || 0}%`,
                            background: 'linear-gradient(90deg, var(--purple-mid), var(--gold-mid))'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Endings Reached */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl text-[--text-primary] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              <span className="text-[--teal-glow]">Endings</span> Reached
            </h2>
            <p className="text-[--text-muted]" style={{ fontFamily: "'Spectral', serif", fontStyle: 'italic' }}>
              How do readers conclude their journeys?
            </p>
          </div>

          <div className="card p-6 md:p-8">
            {endingsReached.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🌙</div>
                <p className="text-[--text-muted]" style={{ fontFamily: "'Spectral', serif" }}>No endings reached yet</p>
              </div>
            ) : (
              <div className="space-y-5">
                {endingsReached.map((ending, idx) => (
                  <div key={ending.scene_id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[--text-primary] flex items-center gap-2" style={{ fontFamily: "'Spectral', serif" }}>
                        <span className="text-[--teal-glow]">✦</span>
                        {ending.scene_title}
                      </span>
                      <span className="text-[--teal-glow] font-medium">
                        {ending.times_reached} <span className="text-[--text-muted]">({ending.percentage || 0}%)</span>
                      </span>
                    </div>
                    <div className="h-3 bg-[--purple-darker] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${ending.percentage || 0}%`,
                          background: 'linear-gradient(90deg, var(--purple-mid), var(--teal-glow))'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Drop-off Points */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl text-[--text-primary] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              <span className="text-[--pink-glow]">Drop-off</span> Points
            </h2>
            <p className="text-[--text-muted]" style={{ fontFamily: "'Spectral', serif", fontStyle: 'italic' }}>
              Where do readers abandon their journey?
            </p>
          </div>

          <div className="card p-6 md:p-8">
            {dropOffPoints.filter(d => d.drop_off_rate > 0).length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-[--text-muted]" style={{ fontFamily: "'Spectral', serif" }}>No significant drop-offs detected</p>
                <p className="text-[--text-muted] text-sm mt-2">Readers are engaged throughout!</p>
              </div>
            ) : (
              <div className="space-y-5">
                {dropOffPoints
                  .filter(d => d.drop_off_rate > 0)
                  .map((point, idx) => (
                    <div key={point.scene_id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[--text-primary]" style={{ fontFamily: "'Spectral', serif" }}>
                          {point.scene_title}
                        </span>
                        <span className="text-[--pink-glow] font-medium">
                          {point.sessions_left} left <span className="text-[--text-muted]">({point.drop_off_rate}%)</span>
                        </span>
                      </div>
                      <div className="h-3 bg-[--purple-darker] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${point.drop_off_rate}%`,
                            background: 'linear-gradient(90deg, var(--purple-mid), var(--pink-glow))'
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-[--purple-mid]/30">
          <Link href="/" className="btn btn-secondary inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return to Stories
          </Link>
        </footer>
      </div>
    </div>
  )
}