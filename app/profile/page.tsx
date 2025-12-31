'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '../components/ThemeToggle'
import { ArchetypeIcon, archetypeColors, archetypeDescriptions } from '../components/ArchetypeIcons'

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  return document.cookie.split('; ').find(row => row.startsWith('visitorId='))?.split('=')[1] || ''
}

interface ProfileData {
  profile: {
    archetype: string
    archetypePercentage: number
    createdAt: string
  }
  stats: {
    storiesPlayed: number
    storiesCompleted: number
    totalChoices: number
    endingsDiscovered: number
    totalEndings: number
  }
  community: {
    totalReaders: number
    archetypeDistribution: { archetype: string; count: number; percentage: number }[]
    mostCompletedStory: { title: string; completionRate: number } | null
    mostPopularArchetype: string | null
    rarestArchetype: string | null
  }
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      const visitorId = getVisitorId()
      if (!visitorId) {
        setError('No profile found. Take the quiz first!')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/analytics/profile?visitorId=${visitorId}`)
        if (res.ok) {
          setData(await res.json())
        } else {
          setError('No profile found. Take the quiz first!')
        }
      } catch {
        setError('Failed to load profile')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[hsl(var(--secondary-foreground))]">{error}</p>
        <Link href="/quiz" className="btn btn-brand">Take the Quiz</Link>
      </div>
    )
  }

  const { profile, stats, community } = data
  const archetypeInfo = archetypeDescriptions[profile.archetype]
  const color = archetypeColors[profile.archetype]

  return (
    <div className="min-h-screen">
      <nav className="border-b border-[hsl(var(--border))]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--foreground))]">
            ← Back
          </Link>
          <span className="font-medium">Your Profile</span>
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Archetype Header */}
        <section className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-4" style={{ color }}>
            <ArchetypeIcon archetype={profile.archetype} className="w-full h-full" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color }}>
            {archetypeInfo?.title}
          </h1>
          <p className="text-[hsl(var(--secondary-foreground))] mb-4">
            {archetypeInfo?.tagline}
          </p>
          <p className="text-sm">
            <span style={{ color }}>{profile.archetypePercentage}%</span> of readers share your archetype
          </p>
        </section>

        {/* Your Journey Stats */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-6">Your Journey</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-6 text-center">
              <p className="text-3xl font-bold" style={{ color }}>{stats.storiesPlayed}</p>
              <p className="text-sm text-[hsl(var(--secondary-foreground))]">Stories Played</p>
            </div>
            <div className="card p-6 text-center">
              <p className="text-3xl font-bold" style={{ color }}>{stats.storiesCompleted}</p>
              <p className="text-sm text-[hsl(var(--secondary-foreground))]">Completed</p>
            </div>
            <div className="card p-6 text-center">
              <p className="text-3xl font-bold" style={{ color }}>{stats.totalChoices}</p>
              <p className="text-sm text-[hsl(var(--secondary-foreground))]">Choices Made</p>
            </div>
            <div className="card p-6 text-center">
              <p className="text-3xl font-bold" style={{ color }}>
                {stats.endingsDiscovered}/{stats.totalEndings}
              </p>
              <p className="text-sm text-[hsl(var(--secondary-foreground))]">Endings Found</p>
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-6">Community</h2>
          
          <div className="card p-6 mb-6">
            <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-4">
              {community.totalReaders.toLocaleString()} readers have discovered their archetype
            </p>
            
            <div className="space-y-3">
              {community.archetypeDistribution.map(a => {
                const isUser = a.archetype === profile.archetype
                const aColor = archetypeColors[a.archetype]
                return (
                  <div key={a.archetype} className="flex items-center gap-3">
                    <div className="w-6 h-6" style={{ color: aColor }}>
                      <ArchetypeIcon archetype={a.archetype} className="w-full h-full" />
                    </div>
                    <span className="w-24 text-sm capitalize">{a.archetype}</span>
                    <div className="flex-1 h-3 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${a.percentage}%`,
                          background: isUser ? aColor : 'hsl(var(--secondary-foreground)/0.3)'
                        }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm">{a.percentage}%</span>
                    {isUser && <span className="text-xs" style={{ color }}>← You</span>}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-6">
              <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-2">Most Popular Archetype</p>
              <div className="flex items-center gap-2">
                {community.mostPopularArchetype && (
                  <>
                    <div className="w-6 h-6" style={{ color: archetypeColors[community.mostPopularArchetype] }}>
                      <ArchetypeIcon archetype={community.mostPopularArchetype} className="w-full h-full" />
                    </div>
                    <span className="font-semibold capitalize">{community.mostPopularArchetype}</span>
                  </>
                )}
              </div>
            </div>
            <div className="card p-6">
              <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-2">Rarest Archetype</p>
              <div className="flex items-center gap-2">
                {community.rarestArchetype && (
                  <>
                    <div className="w-6 h-6" style={{ color: archetypeColors[community.rarestArchetype] }}>
                      <ArchetypeIcon archetype={community.rarestArchetype} className="w-full h-full" />
                    </div>
                    <span className="font-semibold capitalize">{community.rarestArchetype}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-wrap gap-4 justify-center">
          <Link href="/" className="btn btn-brand">Browse Stories</Link>
          <Link href="/quiz" className="btn btn-secondary">Retake Quiz</Link>
        </section>
      </main>
    </div>
  )
}