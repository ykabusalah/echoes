'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/app/components/ThemeToggle'

interface OverviewData {
  overview: {
    totalSessions: number
    totalReaders: number
    completionRate: number
    personalizationPickupRate: number
    generatedChoices: number
  }
  stories: {
    id: string
    title: string
    status: string
    scenes: number
    sessions: number
  }[]
}

export default function Dashboard() {
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_token')
    if (stored) {
      setAuthorized(true)
      fetchData(stored)
    }
  }, [])

  async function fetchData(token: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics/overview', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setData(await res.json())
      } else {
        setAuthorized(false)
        sessionStorage.removeItem('admin_token')
        setError('Session expired')
      }
    } catch {
      setError('Failed to fetch data')
    }
    setLoading(false)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/analytics/overview', {
      headers: { Authorization: `Bearer ${password}` }
    })

    if (res.ok) {
      sessionStorage.setItem('admin_token', password)
      setAuthorized(true)
      setData(await res.json())
    } else {
      setError('Invalid password')
    }
    setLoading(false)
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_token')
    setAuthorized(false)
    setPassword('')
    setData(null)
  }

  // Login screen
  if (!authorized) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="card p-8 w-full max-w-sm border-[hsl(var(--brand)/0.3)]">
          <div className="text-center mb-6">
            <span className="text-2xl">✦</span>
            <h1 className="text-xl font-semibold mt-2 text-[hsl(var(--foreground))]">Echoes Dashboard</h1>
            <p className="text-sm text-[hsl(var(--secondary-foreground))] mt-1">Admin access required</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] mb-4 focus:outline-none focus:border-[hsl(var(--brand))] focus:ring-1 focus:ring-[hsl(var(--brand)/0.5)]"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[hsl(var(--brand))] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Enter Dashboard'}
            </button>
          </form>
          <Link href="/" className="block text-center mt-4 text-sm text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--brand))]">
            ← Back to Echoes
          </Link>
        </div>
      </div>
    )
  }

  // Dashboard content
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <nav className="border-b border-[hsl(var(--border))] bg-[hsl(var(--primary))]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[hsl(var(--brand))]">✦</span>
            <h1 className="font-semibold text-[hsl(var(--foreground))]">Echoes Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard/stories" className="text-sm text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--brand))] transition-colors">
              Stories
            </Link>
            <Link href="/dashboard/personalization" className="text-sm text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--brand))] transition-colors">
              Personalization
            </Link>
            <button onClick={handleLogout} className="text-sm text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <span className="text-2xl animate-pulse">✦</span>
              <p className="text-[hsl(var(--secondary-foreground))] mt-2">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : data ? (
          <>
            {/* Overview Stats */}
            <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
              <div className="card p-6 text-center border-[hsl(var(--brand)/0.2)] hover:border-[hsl(var(--brand)/0.4)] transition-colors">
                <p className="text-3xl font-bold text-[hsl(var(--brand))]">{data.overview.totalSessions}</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">Total Sessions</p>
              </div>
              <div className="card p-6 text-center border-[hsl(var(--brand)/0.2)] hover:border-[hsl(var(--brand)/0.4)] transition-colors">
                <p className="text-3xl font-bold text-[hsl(var(--brand))]">{data.overview.totalReaders}</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">Readers</p>
              </div>
              <div className="card p-6 text-center border-[hsl(var(--gold)/0.3)] hover:border-[hsl(var(--gold)/0.5)] transition-colors">
                <p className="text-3xl font-bold text-[hsl(var(--gold))]">{data.overview.completionRate}%</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">Completion</p>
              </div>
              <div className="card p-6 text-center border-[hsl(var(--gold)/0.3)] hover:border-[hsl(var(--gold)/0.5)] transition-colors">
                <p className="text-3xl font-bold text-[hsl(var(--gold))]">{data.overview.personalizationPickupRate}%</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">Pick Personalized</p>
              </div>
              <div className="card p-6 text-center border-[hsl(var(--brand)/0.2)] hover:border-[hsl(var(--brand)/0.4)] transition-colors">
                <p className="text-3xl font-bold text-[hsl(var(--brand))]">{data.overview.generatedChoices}</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">AI Choices</p>
              </div>
            </section>

            {/* Stories */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))] flex items-center gap-2">
                <span className="text-[hsl(var(--gold))]">◈</span> Stories
              </h2>
              <div className="grid gap-4">
                {data.stories.map(story => (
                  <div key={story.id} className="card p-6 flex items-center justify-between hover:border-[hsl(var(--brand)/0.3)] transition-colors">
                    <div>
                      <p className="font-medium text-[hsl(var(--foreground))]">
                        {story.status === 'FEATURED' && <span className="text-[hsl(var(--gold))]">★ </span>}
                        {story.title}
                      </p>
                      <p className="text-sm text-[hsl(var(--secondary-foreground))]">
                        {story.scenes} scenes · {story.sessions} sessions
                      </p>
                    </div>
                    <Link 
                      href={`/analytics/${story.id}`}
                      className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--foreground))] hover:border-[hsl(var(--brand))] hover:text-[hsl(var(--brand))] transition-colors"
                    >
                      View Analytics
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Links */}
            <section>
              <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))] flex items-center gap-2">
                <span className="text-[hsl(var(--gold))]">◈</span> Quick Links
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/dashboard/stories" 
                  className="px-6 py-3 rounded-lg bg-[hsl(var(--brand))] text-white font-medium hover:opacity-90 transition-opacity"
                >
                  ◈ Manage Stories
                </Link>
                <Link 
                  href="/dashboard/personalization" 
                  className="px-6 py-3 rounded-lg bg-[hsl(var(--brand))] text-white font-medium hover:opacity-90 transition-opacity"
                >
                  ✦ Personalization Analytics
                </Link>
                <Link 
                  href="/" 
                  className="px-6 py-3 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--brand))] hover:text-[hsl(var(--brand))] transition-colors"
                >
                  View Site
                </Link>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  )
}