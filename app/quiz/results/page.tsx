'use client'

import { Suspense, useEffect, useState } from 'react'
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

function QuizResultsContent() {
  const searchParams = useSearchParams()
  const archetype = searchParams.get('archetype') || 'wanderer'
  
  const [stats, setStats] = useState<ArchetypeStats | null>(null)
  const [story, setStory] = useState<RecommendedStory | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showStory, setShowStory] = useState(false)
  const [copied, setCopied] = useState(false)

  const info = archetypeDescriptions[archetype.toLowerCase()] || archetypeDescriptions.wanderer
  const color = archetypeColors[archetype.toLowerCase()] || archetypeColors.wanderer

  useEffect(() => {
    fetch('/api/archetypes/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)

    fetch(`/api/stories/recommend?archetype=${archetype}`)
      .then(r => r.json())
      .then(setStory)
      .catch(console.error)

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
                className="px-6 py-3 rounded-lg bg-[hsl(var(--brand))] text-white font-medium hover:opacity-90 transition-opacity"
              >
                Begin Your Story
              </Link>
            )}
            <Link href="/" className="btn btn-secondary">
              Browse All Stories
            </Link>
          </div>
        </div>

        <div 
          className={`mt-8 transition-all duration-700 delay-500 ${
            showStory ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-4">
            Share your result
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {/* X / Twitter */}
            <button
              onClick={() => {
                const url = typeof window !== 'undefined' ? window.location.origin + '/quiz' : ''
                const text = `I'm ${info.title} in Echoes. What archetype are you?`
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
                window.open(twitterUrl, '_blank', 'width=550,height=420')
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Share
            </button>

            {/* Facebook */}
            <button
              onClick={() => {
                const url = typeof window !== 'undefined' ? window.location.origin + '/quiz' : ''
                const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`I'm ${info.title} in Echoes. What archetype are you?`)}`
                window.open(fbUrl, '_blank', 'width=550,height=420')
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1877F2] text-white hover:bg-[#166FE5] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Share
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => {
                const url = typeof window !== 'undefined' ? window.location.origin + '/quiz' : ''
                const text = `I'm ${info.title} in Echoes. What archetype are you? ${url}`
                const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
                window.open(waUrl, '_blank')
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white hover:bg-[#22C55E] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share
            </button>

            {/* Copy Link */}
            <button
              onClick={async () => {
                const url = typeof window !== 'undefined' ? window.location.origin + '/quiz' : ''
                const text = `✦ The stories we're drawn to reveal who we really are.\n\nI took a quiz that uncovered my reader archetype — I'm ${info.title}.\n\n"${info.tagline}"\n\nCurious what yours is? ${url}`
                try {
                  await navigator.clipboard.writeText(text)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                } catch {
                  prompt('Copy this:', text)
                }
              }}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                copied 
                  ? 'border-green-500 bg-green-500/10 text-green-600' 
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--foreground)/0.3)]'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function QuizResults() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <span className="text-2xl animate-pulse text-[hsl(var(--brand))]">✦</span>
          <p className="text-[hsl(var(--secondary-foreground))] mt-2">Loading your results...</p>
        </div>
      </div>
    }>
      <QuizResultsContent />
    </Suspense>
  )
}