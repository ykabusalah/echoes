'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/app/components/ThemeToggle'
import { ArchetypeIcon, archetypeColors } from '@/app/components/ArchetypeIcons'

interface PersonalizationData {
  pickupRate: {
    comparison: { type: string; count: number; percentage: number }[]
  }
  completionRate: {
    personalized: { sessions: number; completed: number; rate: number } | null
    standard: { sessions: number; completed: number; rate: number } | null
  }
  archetypeAccuracy: {
    archetype: string
    opportunities: number
    pickedOwn: number
    accuracy: number
  }[]
  generation: {
    total: number
    uniqueScenes: number
    avgPerScene: number
  }
  engagement: {
    pathType: string
    avgTimeMs: number
    sessions: number
  }[]
}

export default function PersonalizationDashboard() {
  const router = useRouter()
  const [data, setData] = useState<PersonalizationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      const token = sessionStorage.getItem('admin_token')
      if (!token) {
        router.push('/dashboard')
        return
      }

      try {
        const res = await fetch('/api/analytics/personalization', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          setData(await res.json())
        } else if (res.status === 401) {
          sessionStorage.removeItem('admin_token')
          router.push('/dashboard')
        } else {
          const err = await res.json().catch(() => ({}))
          setError(err.error || 'Failed to fetch data')
        }
      } catch {
        setError('Failed to fetch data')
      }
      setLoading(false)
    }
    fetchData()
  }, [router])

  function handleLogout() {
    sessionStorage.removeItem('admin_token')
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <p className="text-[hsl(var(--secondary-foreground))]">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/dashboard" className="btn btn-secondary">← Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <nav className="border-b border-[hsl(var(--border))]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--foreground))]">
              ← Dashboard
            </Link>
            <span className="text-[hsl(var(--border))]">/</span>
            <h1 className="font-semibold text-[hsl(var(--foreground))]">Personalization</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button onClick={handleLogout} className="text-sm text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--foreground))]">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Pickup Rate Comparison */}
        {data?.pickupRate.comparison && data.pickupRate.comparison.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">Choice Type Distribution</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {data.pickupRate.comparison.map(item => (
                <div key={item.type} className="card p-6 text-center">
                  <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-2">{item.type}</p>
                  <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{item.percentage}%</p>
                  <p className="text-xs text-[hsl(var(--secondary-foreground))]">{item.count} choices made</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Completion Rates */}
        {(data?.completionRate.personalized || data?.completionRate.standard) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">Completion by Path Type</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {data.completionRate.personalized && (
                <div className="card p-6">
                  <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-2">Personalized Path</p>
                  <p className="text-3xl font-bold text-[hsl(var(--brand))]">{data.completionRate.personalized.rate}%</p>
                  <p className="text-xs text-[hsl(var(--secondary-foreground))]">
                    {data.completionRate.personalized.completed} of {data.completionRate.personalized.sessions} completed
                  </p>
                </div>
              )}
              {data.completionRate.standard && (
                <div className="card p-6">
                  <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-2">Standard Path</p>
                  <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{data.completionRate.standard.rate}%</p>
                  <p className="text-xs text-[hsl(var(--secondary-foreground))]">
                    {data.completionRate.standard.completed} of {data.completionRate.standard.sessions} completed
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Archetype Accuracy */}
        {data?.archetypeAccuracy && data.archetypeAccuracy.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">
              Archetype Personalization Accuracy
            </h2>
            <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-6">
              How often readers pick the choice generated for their archetype
            </p>
            <div className="space-y-4">
              {data.archetypeAccuracy.map(item => (
                <div key={item.archetype} className="card p-4 flex items-center gap-4">
                  <ArchetypeIcon 
                    archetype={item.archetype} 
                    className="w-8 h-8" 
                    style={{ color: archetypeColors[item.archetype] }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[hsl(var(--foreground))]">{item.archetype}</span>
                      <span className="text-sm font-bold text-[hsl(var(--foreground))]">{item.accuracy}%</span>
                    </div>
                    <div className="h-2 bg-[hsl(var(--border))] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.accuracy}%`,
                          backgroundColor: archetypeColors[item.archetype]
                        }}
                      />
                    </div>
                    <p className="text-xs text-[hsl(var(--secondary-foreground))] mt-1">
                      {item.pickedOwn} of {item.opportunities} opportunities
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Generation Stats */}
        {data?.generation && data.generation.total > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">AI Generation Stats</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card p-6 text-center">
                <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{data.generation.total}</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">Total Generated</p>
              </div>
              <div className="card p-6 text-center">
                <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{data.generation.uniqueScenes}</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">Unique Scenes</p>
              </div>
              <div className="card p-6 text-center">
                <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{data.generation.avgPerScene}</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">Avg per Scene</p>
              </div>
            </div>
          </section>
        )}

        {/* Engagement */}
        {data?.engagement && data.engagement.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">Time Engagement</h2>
            <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-6">
              Average time spent by path type
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {data.engagement.map(e => (
                <div key={e.pathType} className="card p-6 text-center">
                  <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-2">{e.pathType} Path</p>
                  <p className="text-3xl font-bold text-[hsl(var(--foreground))]">
                    {(e.avgTimeMs / 1000 / 60).toFixed(1)} min
                  </p>
                  <p className="text-xs text-[hsl(var(--secondary-foreground))]">
                    avg across {e.sessions} sessions
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No Data State */}
        {data && !data.pickupRate.comparison.length && !data.archetypeAccuracy.length && (
          <div className="card p-12 text-center">
            <p className="text-[hsl(var(--secondary-foreground))] mb-4">
              No personalization data yet. Data will appear once readers start making choices.
            </p>
            <Link href="/" className="btn btn-brand">View Site</Link>
          </div>
        )}

        <div className="text-center pt-8">
          <Link href="/dashboard" className="btn btn-secondary">← Back to Dashboard</Link>
        </div>
      </main>
    </div>
  )
}