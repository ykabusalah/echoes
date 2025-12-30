'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '../../components/ThemeToggle'

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

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
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
        <div className="spinner" />
        <p className="text-sm text-[hsl(var(--secondary-foreground))]">Loading analytics...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <span className="text-5xl">📊</span>
        <h1 className="text-2xl font-semibold">Failed to Load Analytics</h1>
        <Link href="/" className="btn btn-secondary">
          Return Home
        </Link>
      </div>
    )
  }

  const { sessionStats, choicePopularity, dropOffPoints, endingsReached } = analytics

  const choicesByScene = choicePopularity.reduce((acc, choice) => {
    if (!acc[choice.from_scene]) acc[choice.from_scene] = []
    acc[choice.from_scene].push(choice)
    return acc
  }, {} as Record<string, ChoiceData[]>)

  return (
    <div className="min-h-screen">
      {/* Nav Bar */}
      <nav className="border-b border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Link>
          <span className="font-medium">Story Analytics</span>
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <span className="badge badge-brand mb-4">
            <SparkleIcon className="w-3 h-3" />
            Reader Insights
          </span>
          <h1 className="text-3xl font-semibold">Analytics Dashboard</h1>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="card p-6 text-center">
            <UsersIcon className="w-8 h-8 mx-auto mb-3 text-[hsl(var(--brand))]" />
            <p className="stat-value text-[hsl(var(--foreground))]">
              {sessionStats.total_sessions}
            </p>
            <p className="stat-label">Total Journeys</p>
          </div>

          <div className="card p-6 text-center">
            <CheckIcon className="w-8 h-8 mx-auto mb-3 text-[hsl(var(--success))]" />
            <p className="stat-value text-[hsl(var(--foreground))]">
              {sessionStats.completed_sessions}
            </p>
            <p className="stat-label">Completed</p>
          </div>

          <div className="card p-6 text-center">
            <TrendingIcon className="w-8 h-8 mx-auto mb-3 text-[hsl(var(--info))]" />
            <p className="stat-value text-[hsl(var(--foreground))]">
              {sessionStats.completion_rate || 0}%
            </p>
            <p className="stat-label">Completion Rate</p>
          </div>
        </div>

        {/* Choice Popularity */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">Choice Popularity</h2>
            <p className="text-sm text-[hsl(var(--secondary-foreground))]">
              Which paths do readers choose most often?
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(choicesByScene).map(([sceneName, choices]) => (
              <div key={sceneName} className="card p-6">
                <h3 className="text-sm font-medium text-[hsl(var(--brand))] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[hsl(var(--brand))]" />
                  {sceneName}
                </h3>
                <div className="space-y-4">
                  {choices.map((choice) => (
                    <div key={choice.choice_id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="truncate mr-4">{choice.choice_text}</span>
                        <span className="text-[hsl(var(--secondary-foreground))] whitespace-nowrap">
                          {choice.times_chosen} ({choice.percentage || 0}%)
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-bar-fill"
                          style={{ width: `${choice.percentage || 0}%` }}
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
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">Endings Reached</h2>
            <p className="text-sm text-[hsl(var(--secondary-foreground))]">
              How do readers conclude their journeys?
            </p>
          </div>

          <div className="card p-6">
            {endingsReached.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🌙</span>
                <p className="text-[hsl(var(--secondary-foreground))]">No endings reached yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {endingsReached.map((ending) => (
                  <div key={ending.scene_id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2">
                        <span className="text-[hsl(var(--success))]">✦</span>
                        {ending.scene_title}
                      </span>
                      <span className="text-[hsl(var(--secondary-foreground))]">
                        {ending.times_reached} ({ending.percentage || 0}%)
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill"
                        style={{ 
                          width: `${ending.percentage || 0}%`,
                          background: 'hsl(var(--success))'
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
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">Drop-off Points</h2>
            <p className="text-sm text-[hsl(var(--secondary-foreground))]">
              Where do readers abandon their journey?
            </p>
          </div>

          <div className="card p-6">
            {dropOffPoints.filter(d => d.drop_off_rate > 0).length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🎉</span>
                <p className="text-[hsl(var(--secondary-foreground))]">No significant drop-offs</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))] mt-1">Readers stay engaged throughout!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dropOffPoints
                  .filter(d => d.drop_off_rate > 0)
                  .map((point) => (
                    <div key={point.scene_id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{point.scene_title}</span>
                        <span className="text-[hsl(var(--warning))]">
                          {point.sessions_left} left ({point.drop_off_rate}%)
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-bar-fill"
                          style={{ 
                            width: `${point.drop_off_rate}%`,
                            background: 'hsl(var(--warning))'
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
        <footer className="text-center pt-8 border-t border-[hsl(var(--border))]">
          <Link href="/" className="btn btn-secondary">
            ← Return to Stories
          </Link>
        </footer>
      </main>
    </div>
  )
}