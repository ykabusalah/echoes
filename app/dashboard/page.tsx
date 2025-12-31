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
        <div className="card p-8 w-full max-w-sm">
          <h1 className="text-xl font-semibold mb-6 text-center text-[hsl(var(--foreground))]">Admin Dashboard</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] mb-4"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-brand w-full"
            >
              {loading ? 'Checking...' : 'Login'}
            </button>
          </form>
          <Link href="/" className="block text-center mt-4 text-sm text-[hsl(var(--secondary-foreground))]">
            ← Back to site
          </Link>
        </div>
      </div>
    )
  }

  // Dashboard content
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <nav className="border-b border-[hsl(var(--border))]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-semibold text-[hsl(var(--foreground))]">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard/personalization" className="text-sm text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--foreground))]">
              Personalization
            </Link>
            <button onClick={handleLogout} className="text-sm text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--foreground))]">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <p className="text-center text-[hsl(var(--secondary-foreground))]">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : data ? (
          <>
            {/* Overview Stats */}
            <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
              <div className="card p-6 text-center">
                <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{data.overview.totalSessions}</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">Total Sessions</p>
              </div>
              <div className="card p-6 text-center">
                <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{data.overview.totalReaders}</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">Readers</p>
              </div>
              <div className="card p-6 text-center">
                <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{data.overview.completionRate}%</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">Completion</p>
              </div>
              <div className="card p-6 text-center">
                <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{data.overview.personalizationPickupRate}%</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">Pick Personalized</p>
              </div>
              <div className="card p-6 text-center">
                <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{data.overview.generatedChoices}</p>
                <p className="text-sm text-[hsl(var(--secondary-foreground))]">AI Choices</p>
              </div>
            </section>

            {/* Stories */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">Stories</h2>
              <div className="grid gap-4">
                {data.stories.map(story => (
                  <div key={story.id} className="card p-6 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[hsl(var(--foreground))]">
                        {story.status === 'FEATURED' && '⭐ '}{story.title}
                      </p>
                      <p className="text-sm text-[hsl(var(--secondary-foreground))]">
                        {story.scenes} scenes · {story.sessions} sessions
                      </p>
                    </div>
                    <Link 
                      href={`/analytics/${story.id}`}
                      className="btn btn-secondary text-sm"
                    >
                      View Analytics
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Links */}
            <section>
              <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">Quick Links</h2>
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard/personalization" className="btn btn-brand">
                  Personalization Analytics
                </Link>
                <Link href="/" className="btn btn-secondary">
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