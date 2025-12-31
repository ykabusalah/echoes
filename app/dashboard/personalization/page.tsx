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
        <div className="text-center">
          <span className="text-2xl animate-pulse text-[hsl(var(--brand))]">✦</span>
          <p className="text-[hsl(var(--secondary-foreground))] mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/dashboard" className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--brand))]">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <nav className="border-b border-[hsl(var(--border))] bg-[hsl(var(--primary))]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--brand))] transition-colors">
              ← Dashboard
            </Link>
            <span className="text-[hsl(var(--border))]">/</span>
            <h1 className="font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
              <span className="text-[hsl(var(--brand))]">✦</span> Personalization
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button onClick={handleLogout} className="text-sm text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Pickup Rate Comparison */}
        {data?.pickupRate.comparison && data.pickupRate.comparison.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))] flex items-center gap-2">
              <span className="text-[hsl(var(--gold))]">◈</span> Choice Type Distribution
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {data.pickupRate.comparison.map(item => (
                <div 
                  key={item.type} 
                  className={`card p-6 text-center ${
                    item.type === 'Personalized' 
                      ? 'border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.05)]' 
                      : ''
                  }`}
                >
                  <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-2">{item.type}</p>
                  <p className={`text-3xl font-bold ${
                    item.type === 'Personalized' ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--foreground))]'
                  }`}>
                    {item.percentage}%
                  </p>
                  <p className="text-xs text-[hsl(var(--secondary-foreground))]">{item.count} choices made</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Completion Rates */}
        {(data?.completionRate.personalized || data?.completionRate.standard) && (
          <section>
            <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))] flex items-center gap-2">
              <span className="text-[hsl(var(--gold))]">◈</span> Completion by Path Type
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {data.completionRate.personalized && (
                <div className="card p-6 border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.05)]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[hsl(var(--brand))]">✦</span>
                    <p className="text-sm text-[hsl(var(--secondary-foreground))]">Personalized Path</p>
                  </div>
                  <p className="text-3xl font-bold text-[hsl(var(--brand))]">{data.completionRate.personalized.rate}%</p>
                  <p className="text-xs text-[hsl(var(--secondary-foreground))] mt-1">
                    {data.completionRate.personalized.completed} of {data.completionRate.personalized.sessions} completed
                  </p>
                </div>
              )}
              {data.completionRate.standard && (
                <div className="card p-6">
                  <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-2">Standard Path</p>
                  <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{data.completionRate.standard.rate}%</p>
                  <p className="text-xs text-[hsl(var(--secondary-foreground))] mt-1">
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
            <h2 className="text-lg font-semibold mb-2 text-[hsl(var(--foreground))] flex items-center gap-2">
              <span className="text-[hsl(var(--gold))]">◈</span> Archetype Personalization Accuracy
            </h2>
            <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-6">
              How often readers pick the choice crafted for their archetype
            </p>
            <div className="space-y-4">
              {data.archetypeAccuracy.map(item => (
                <div key={item.archetype} className="card p-4 flex items-center gap-4 hover:border-[hsl(var(--brand)/0.3)] transition-colors">
                  <ArchetypeIcon 
                    archetype={item.archetype} 
                    className="w-8 h-8" 
                    style={{ color: archetypeColors[item.archetype] }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[hsl(var(--foreground))]">{item.archetype}</span>
                      <span className="text-sm font-bold" style={{ color: archetypeColors[item.archetype] }}>
                        {item.accuracy}%
                      </span>
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
            <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))] flex items-center gap-2">
              <span className="text-[hsl(var(--gold))]">◈</span> AI Generation Stats
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card p-6 text-center border-[hsl(var(--brand)/0.2)]">
                <p className="text-3xl font-bold text-[hsl(var(--brand))]">{data.generation.total}</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">Total Generated</p>
              </div>
              <div className="card p-6 text-center border-[hsl(var(--gold)/0.2)]">
                <p className="text-3xl font-bold text-[hsl(var(--gold))]">{data.generation.uniqueScenes}</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">Unique Scenes</p>
              </div>
              <div className="card p-6 text-center border-[hsl(var(--brand)/0.2)]">
                <p className="text-3xl font-bold text-[hsl(var(--brand))]">{data.generation.avgPerScene}</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">Avg per Scene</p>
              </div>
            </div>
          </section>
        )}

        {/* Engagement */}
        {data?.engagement && data.engagement.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-2 text-[hsl(var(--foreground))] flex items-center gap-2">
              <span className="text-[hsl(var(--gold))]">◈</span> Time Engagement
            </h2>
            <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-6">
              Average time spent by path type
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {data.engagement.map(e => (
                <div 
                  key={e.pathType} 
                  className={`card p-6 text-center ${
                    e.pathType === 'Personalized' 
                      ? 'border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.05)]' 
                      : ''
                  }`}
                >
                  <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-2">{e.pathType} Path</p>
                  <p className={`text-3xl font-bold ${
                    e.pathType === 'Personalized' ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--foreground))]'
                  }`}>
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
          <div className="card p-12 text-center border-[hsl(var(--brand)/0.2)]">
            <span className="text-4xl text-[hsl(var(--brand)/0.5)]">✦</span>
            <p className="text-[hsl(var(--secondary-foreground))] mt-4 mb-6">
              No personalization data yet. Data will appear once readers start making choices.
            </p>
            <Link 
              href="/" 
              className="inline-block px-6 py-3 rounded-lg bg-[hsl(var(--brand))] text-white font-medium hover:opacity-90 transition-opacity"
            >
              View Site
            </Link>
          </div>
        )}

        <div className="text-center pt-8">
          <Link 
            href="/dashboard" 
            className="px-6 py-3 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--brand))] hover:text-[hsl(var(--brand))] transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}