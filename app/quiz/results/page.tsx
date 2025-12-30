'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArchetypeIcon, archetypeColors, archetypeDescriptions } from '@/app/components/ArchetypeIcons'

interface ArchetypeStats {
  total: number
  distribution: {
    archetype: string
    count: number
    percentage: number
  }[]
}

interface RecommendedStory {
  id: string
  title: string
  description: string
  theme: string
  sceneCount: number
  readers: number
}

export default function QuizResults() {
  const searchParams = useSearchParams()
  const archetype = searchParams.get('archetype') || 'wanderer'
  
  const [stats, setStats] = useState<ArchetypeStats | null>(null)
  const [story, setStory] = useState<RecommendedStory | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showStory, setShowStory] = useState(false)

  const info = archetypeDescriptions[archetype.toLowerCase()] || archetypeDescriptions.wanderer
  const color = archetypeColors[archetype.toLowerCase()] || archetypeColors.wanderer

  useEffect(() => {
    // Fetch archetype distribution
    fetch('/api/archetypes/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)

    // Fetch recommended story
    fetch(`/api/stories/recommend?archetype=${archetype}`)
      .then(r => r.json())
      .then(setStory)
      .catch(console.error)

    // Staggered reveal animation
    setTimeout(() => setRevealed(true), 500)
    setTimeout(() => setShowStats(true), 2000)
    setTimeout(() => setShowStory(true), 3000)
  }, [archetype])

  const myPercentage = stats?.distribution.find(
    d => d.archetype.toLowerCase() === archetype.toLowerCase()
  )?.percentage || 0

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[hsl(var(--background))]">
      <div className="max-w-lg w-full text-center">
        
        {/* Archetype Icon & Title */}
        <div 
          className={`transition-all duration-1000 ${
            revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <div 
            className="w-32 h-32 mx-auto mb-6 transition-all duration-500"
            style={{ color }}
          >
            <ArchetypeIcon archetype={archetype} className="w-full h-full" />
          </div>

          <p className="text-sm uppercase tracking-[0.3em] text-[hsl(var(--secondary-foreground))] mb-2">
            You are
          </p>
          
          <h1 
            className="text-4xl md:text-5xl font-bold mb-3 transition-colors duration-500"
            style={{ color }}
          >
            {info.title}
          </h1>
          
          <p className="text-lg text-[hsl(var(--secondary-foreground))] italic mb-6">
            "{info.tagline}"
          </p>
          
          <p className="text-[hsl(var(--foreground))] leading-relaxed mb-8">
            {info.description}
          </p>
        </div>

        {/* Archetype Distribution Stats */}
        <div 
          className={`card p-6 mb-6 transition-all duration-700 ${
            showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-4">
            Community Distribution
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <span 
              className="text-4xl font-bold"
              style={{ color }}
            >
              {myPercentage}%
            </span>
            <span className="text-[hsl(var(--secondary-foreground))]">
              of readers share your archetype
            </span>
          </div>

          {stats && (
            <div className="space-y-2">
              {stats.distribution.map(d => {
                const isMe = d.archetype.toLowerCase() === archetype.toLowerCase()
                const dColor = archetypeColors[d.archetype.toLowerCase()] || 'hsl(var(--muted))'
                return (
                  <div key={d.archetype} className="flex items-center gap-3">
                    <div className="w-20 text-right text-xs capitalize text-[hsl(var(--secondary-foreground))]">
                      {d.archetype}
                    </div>
                    <div className="flex-1 h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${d.percentage}%`,
                          background: isMe ? dColor : 'hsl(var(--secondary-foreground)/0.3)'
                        }}
                      />
                    </div>
                    <div className="w-12 text-left text-xs text-[hsl(var(--secondary-foreground))]">
                      {d.percentage}%
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          {stats && (
            <p className="text-xs text-[hsl(var(--secondary-foreground))] mt-4">
              Based on {stats.total.toLocaleString()} readers
            </p>
          )}
        </div>

        {/* Recommended Story */}
        <div 
          className={`transition-all duration-700 ${
            showStory ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {story && (
            <div className="card p-6 mb-6 text-left">
              <p className="text-xs uppercase tracking-wider text-[hsl(var(--secondary-foreground))] mb-2">
                Recommended for you
              </p>
              <h2 className="text-xl font-semibold mb-2">{story.title}</h2>
              <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-4">
                {story.description}
              </p>
              <div className="flex gap-4 text-xs text-[hsl(var(--secondary-foreground))]">
                <span>{story.sceneCount} scenes</span>
                <span>•</span>
                <span>{story.readers} readers</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {story && (
              <Link 
                href={`/play/${story.id}`} 
                className="btn btn-brand"
              >
                Begin Your Story
              </Link>
            )}
            <Link href="/" className="btn btn-secondary">
              Browse All Stories
            </Link>
          </div>
        </div>

        {/* Share */}
        <div 
          className={`mt-8 transition-all duration-700 delay-500 ${
            showStory ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-xs text-[hsl(var(--secondary-foreground))]">
            Share your result: "I'm {info.title}. What are you?"
          </p>
        </div>
      </div>
    </div>
  )
}