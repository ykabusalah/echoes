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
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-stone-100">
        <p>Loading analytics...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-stone-100">
        <p>Failed to load analytics</p>
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
    <div className="min-h-screen bg-stone-900 text-stone-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-amber-500">Analytics</h1>
          <Link href="/" className="text-stone-400 hover:text-stone-200">
            ← Back to stories
          </Link>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-stone-800 rounded-lg p-6 text-center">
            <p className="text-4xl font-bold text-amber-400">{sessionStats.total_sessions}</p>
            <p className="text-stone-400 text-sm mt-1">Total Sessions</p>
          </div>
          <div className="bg-stone-800 rounded-lg p-6 text-center">
            <p className="text-4xl font-bold text-amber-400">{sessionStats.completed_sessions}</p>
            <p className="text-stone-400 text-sm mt-1">Completed</p>
          </div>
          <div className="bg-stone-800 rounded-lg p-6 text-center">
            <p className="text-4xl font-bold text-amber-400">{sessionStats.completion_rate || 0}%</p>
            <p className="text-stone-400 text-sm mt-1">Completion Rate</p>
          </div>
        </div>

        {/* Choice Popularity */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Choice Popularity</h2>
          <div className="space-y-6">
            {Object.entries(choicesByScene).map(([sceneName, choices]) => (
              <div key={sceneName} className="bg-stone-800 rounded-lg p-6">
                <h3 className="text-amber-400 text-sm uppercase tracking-wide mb-4">{sceneName}</h3>
                <div className="space-y-3">
                  {choices.map((choice) => (
                    <div key={choice.choice_id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="truncate mr-4">{choice.choice_text}</span>
                        <span className="text-stone-400 whitespace-nowrap">
                          {choice.times_chosen} ({choice.percentage || 0}%)
                        </span>
                      </div>
                      <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all"
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
          <h2 className="text-xl font-semibold mb-4">Endings Reached</h2>
          <div className="bg-stone-800 rounded-lg p-6">
            {endingsReached.length === 0 ? (
              <p className="text-stone-500">No endings reached yet</p>
            ) : (
              <div className="space-y-3">
                {endingsReached.map((ending) => (
                  <div key={ending.scene_id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{ending.scene_title}</span>
                      <span className="text-stone-400">
                        {ending.times_reached} ({ending.percentage || 0}%)
                      </span>
                    </div>
                    <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${ending.percentage || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Drop-off Points */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Drop-off Points</h2>
          <div className="bg-stone-800 rounded-lg p-6">
            {dropOffPoints.filter(d => d.drop_off_rate > 0).length === 0 ? (
              <p className="text-stone-500">No significant drop-offs detected</p>
            ) : (
              <div className="space-y-3">
                {dropOffPoints
                  .filter(d => d.drop_off_rate > 0)
                  .map((point) => (
                    <div key={point.scene_id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{point.scene_title}</span>
                        <span className="text-red-400">
                          {point.sessions_left} left ({point.drop_off_rate}%)
                        </span>
                      </div>
                      <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full transition-all"
                          style={{ width: `${point.drop_off_rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}