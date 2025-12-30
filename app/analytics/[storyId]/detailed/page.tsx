'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface TimeData {
  scene_id: string
  scene_title: string
  scene_order: number
  avg_time_ms: number
  median_time_ms: number
  total_views: number
  is_ending: boolean
}

interface EngagementData {
  scene_id: string
  scene_title: string
  hover_count: number
  reread_count: number
  hesitation_count: number
  engagement_score: number
}

interface HesitationData {
  choice_id: string
  choice_text: string
  from_scene: string
  avg_decision_time_ms: number
  times_chosen: number
}

interface PathData {
  from_scene_id: string
  from_scene_title: string
  to_scene_id: string
  to_scene_title: string
  transition_count: number
  percentage: number
}

interface PatternData {
  hour_of_day: number
  day_of_week: number
  session_count: number
}

interface AnalyticsData {
  timePerScene: TimeData[]
  engagementHeatmap: EngagementData[]
  choiceHesitation: HesitationData[]
  pathHeatmap: PathData[]
  readingPatterns: PatternData[]
}

export default function DetailedAnalytics() {
  const { storyId } = useParams()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/${storyId}/detailed`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [storyId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading analytics...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No data available
      </div>
    )
  }

  const maxTime = Math.max(...data.timePerScene.map(s => s.avg_time_ms), 1)
  const maxEngagement = Math.max(...data.engagementHeatmap.map(s => s.engagement_score), 1)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const patternGrid = Array.from({ length: 7 }, () => Array(24).fill(0))
  data.readingPatterns.forEach(p => {
    patternGrid[p.day_of_week][p.hour_of_day] = p.session_count
  })
  const maxPatternCount = Math.max(...data.readingPatterns.map(p => p.session_count), 1)

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <header className="flex items-center justify-between">
          <div>
            <Link 
              href={`/analytics/${storyId}`} 
              className="text-sm text-[hsl(var(--secondary-foreground))] hover:underline"
            >
              ← Back to Overview
            </Link>
            <h1 className="text-2xl font-bold mt-2">Detailed Story Analytics</h1>
          </div>
        </header>

        {/* Time Spent Heatmap */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold mb-1">⏱️ Time Spent Per Scene</h2>
          <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-6">
            Average reading time (darker = longer)
          </p>
          <div className="space-y-3">
            {data.timePerScene.map(scene => {
              const intensity = scene.avg_time_ms / maxTime
              return (
                <div key={scene.scene_id} className="flex items-center gap-4">
                  <div className="w-40 text-sm truncate" title={scene.scene_title}>
                    {scene.is_ending && '🏁 '}{scene.scene_title}
                  </div>
                  <div className="flex-1 h-8 bg-[hsl(var(--muted))] rounded overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${intensity * 100}%`,
                        background: `hsl(${200 + intensity * 60}, ${50 + intensity * 30}%, ${30 + intensity * 20}%)`
                      }}
                    />
                  </div>
                  <div className="w-24 text-right text-sm">
                    {(scene.avg_time_ms / 1000).toFixed(1)}s avg
                  </div>
                  <div className="w-20 text-right text-xs text-[hsl(var(--secondary-foreground))]">
                    {scene.total_views} views
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Engagement Heatmap */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold mb-1">🔥 Engagement Heatmap</h2>
          <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-6">
            Where readers pause, hover, and re-read
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.engagementHeatmap.map(scene => {
              const intensity = scene.engagement_score / maxEngagement
              return (
                <div
                  key={scene.scene_id}
                  className="p-4 rounded-lg border transition-all hover:scale-105"
                  style={{
                    background: `hsla(${20 + intensity * 30}, ${60 + intensity * 30}%, ${85 - intensity * 40}%, ${0.3 + intensity * 0.5})`,
                    borderColor: `hsla(${20 + intensity * 30}, ${60 + intensity * 30}%, 50%, ${intensity})`
                  }}
                >
                  <div className="font-medium text-sm truncate mb-2" title={scene.scene_title}>
                    {scene.scene_title}
                  </div>
                  <div className="text-xs space-y-1 text-[hsl(var(--secondary-foreground))]">
                    <div>👆 {scene.hover_count} choice hovers</div>
                    <div>📖 {scene.reread_count} re-reads</div>
                    <div>⏸️ {scene.hesitation_count} hesitations</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Choice Hesitation */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold mb-1">🤔 Decision Time Analysis</h2>
          <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-6">
            Which choices make readers pause longest?
          </p>
          <div className="space-y-4">
            {data.choiceHesitation.slice(0, 10).map(choice => (
              <div 
                key={choice.choice_id} 
                className="flex items-start gap-4 p-3 bg-[hsl(var(--muted))] rounded-lg"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">"{choice.choice_text}"</div>
                  <div className="text-xs text-[hsl(var(--secondary-foreground))] mt-1">
                    from: {choice.from_scene}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {(choice.avg_decision_time_ms / 1000).toFixed(1)}s
                  </div>
                  <div className="text-xs text-[hsl(var(--secondary-foreground))]">
                    {choice.times_chosen} picks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Path Flow */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold mb-1">🔀 Story Path Flow</h2>
          <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-6">
            Most common scene transitions
          </p>
          <div className="space-y-2">
            {data.pathHeatmap.slice(0, 15).map((path, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="w-32 truncate text-right" title={path.from_scene_title}>
                  {path.from_scene_title}
                </span>
                <span className="text-[hsl(var(--secondary-foreground))]">→</span>
                <div className="flex-1 h-2 bg-[hsl(var(--muted))] rounded overflow-hidden">
                  <div 
                    className="h-full bg-[hsl(var(--brand))]" 
                    style={{ width: `${path.percentage}%` }} 
                  />
                </div>
                <span className="w-32 truncate" title={path.to_scene_title}>
                  {path.to_scene_title}
                </span>
                <span className="w-16 text-right text-[hsl(var(--secondary-foreground))]">
                  {path.percentage}%
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Reading Time Patterns */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold mb-1">📅 When Readers Play</h2>
          <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-6">
            Activity heatmap by day and hour
          </p>
          <div className="overflow-x-auto">
            <div 
              className="grid gap-1" 
              style={{ gridTemplateColumns: 'auto repeat(24, 1fr)', minWidth: 600 }}
            >
              <div />
              {Array.from({ length: 24 }, (_, h) => (
                <div 
                  key={h} 
                  className="text-xs text-center text-[hsl(var(--secondary-foreground))]"
                >
                  {h % 6 === 0 ? `${h}:00` : ''}
                </div>
              ))}
              {days.map((day, d) => (
                <>
                  <div key={`label-${d}`} className="text-xs text-right pr-2">{day}</div>
                  {patternGrid[d].map((count, h) => {
                    const intensity = count / maxPatternCount
                    return (
                      <div
                        key={`${d}-${h}`}
                        className="aspect-square rounded-sm"
                        style={{
                          background: `hsla(${140 + intensity * 80}, ${50 + intensity * 30}%, ${90 - intensity * 50}%, ${0.3 + intensity * 0.7})`
                        }}
                        title={`${day} ${h}:00 - ${count} sessions`}
                      />
                    )
                  })}
                </>
              ))}
            </div>
          </div>
        </section>

        <footer className="text-center pt-8 border-t border-[hsl(var(--border))]">
          <Link href="/" className="btn btn-secondary">
            ← Return to Stories
          </Link>
        </footer>
      </div>
    </div>
  )
}