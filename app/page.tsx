'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Story = {
  id: string
  title: string
  description: string | null
  coverImage: string | null
  theme: string | null
  generatedBy: string | null
  featuredAt: string | null
  createdAt: string
  _count: {
    scenes: number
    characters: number
    readerSessions: number
  }
}

type StoriesResponse = {
  featured: Story | null
  archived: Story[]
}

function Sparkle({ style }: { style: React.CSSProperties }) {
  return <div className="sparkle" style={style} />
}

function FloatingOrb({ className, style }: { className: string; style: React.CSSProperties }) {
  return <div className={`orb ${className}`} style={style} />
}

export default function Home() {
  const [data, setData] = useState<StoriesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number }[]>([])

  useEffect(() => {
    const newSparkles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }))
    setSparkles(newSparkles)
  }, [])

  useEffect(() => {
    async function fetchStories() {
      const res = await fetch('/api/stories')
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
      setLoading(false)
    }
    fetchStories()
  }, [])

  const featured = data?.featured
  const archived = data?.archived || []

  return (
    <div className="min-h-screen relative">
      {/* Floating orbs */}
      <FloatingOrb className="orb-purple animate-float-slow" style={{ width: '400px', height: '400px', top: '5%', left: '10%', opacity: 0.4 }} />
      <FloatingOrb className="orb-gold animate-float" style={{ width: '300px', height: '300px', top: '60%', right: '5%', opacity: 0.3, animationDelay: '2s' }} />
      <FloatingOrb className="orb-teal animate-float-slow" style={{ width: '250px', height: '250px', bottom: '10%', left: '20%', opacity: 0.25, animationDelay: '4s' }} />

      {/* Sparkles */}
      {sparkles.map(s => (
        <Sparkle key={s.id} style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.delay}s` }} />
      ))}

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-36 text-center">
          {/* Welcome badge */}
          <div className="mb-8">
            <span className="inline-block px-6 py-2 rounded-full text-sm tracking-[0.25em] uppercase
              bg-gradient-to-r from-[--purple-dark]/80 to-[--purple-mid]/80 
              border border-[--purple-light]/50 text-[--gold-light]
              shadow-lg shadow-purple-900/50">
              ✦ Welcome to ✦
            </span>
          </div>
          
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-7xl md:text-9xl font-semibold tracking-wide text-gradient drop-shadow-2xl" 
                style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}>
              Echoes
            </h1>
            <div className="mt-4 flex justify-center gap-3">
              <span className="w-12 h-1 bg-gradient-to-r from-transparent via-[--gold-mid] to-transparent rounded-full" />
              <span className="w-3 h-3 bg-[--gold-mid] rounded-full animate-pulse" />
              <span className="w-12 h-1 bg-gradient-to-r from-transparent via-[--gold-mid] to-transparent rounded-full" />
            </div>
          </div>
          
          {/* Tagline */}
          <p className="text-2xl md:text-3xl text-[--text-secondary] max-w-2xl mx-auto mb-12 leading-relaxed"
             style={{ fontFamily: "'Spectral', Georgia, serif", fontStyle: 'italic' }}>
            <span className="text-[--gold-light]">Every choice</span> ripples forward.
            <br />
            <span className="text-[--purple-glow]">Every story</span> remembers.
          </p>

          {/* New story every Monday notice */}
          <p className="text-[--text-muted] mb-8 text-sm" style={{ fontFamily: "'Spectral', serif" }}>
            ✨ A new AI-generated story appears every Monday
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/quiz" className="btn btn-primary text-lg px-10 py-4 inline-flex items-center gap-3" style={{ opacity: 1, color: '#12081f' }}>
              <span>Discover Your Archetype</span>
              <span className="text-xl">✦</span>
            </Link>
            <a href="#stories" className="btn btn-secondary text-lg px-8 py-4 inline-flex items-center gap-3" style={{ opacity: 1 }}>
              <span>Browse Stories</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </div>
        
        {/* Decorative divider */}
        <div className="divider max-w-2xl mx-auto px-6 py-8">
          <svg className="w-8 h-8 text-[--gold-mid]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
      </header>

      {/* Stories Section */}
      <main id="stories" className="relative max-w-6xl mx-auto px-6 py-16">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[--purple-mid] border-t-[--gold-mid] rounded-full animate-spin" />
            </div>
            <p className="text-[--text-muted] animate-pulse">Summoning stories...</p>
          </div>
        ) : (
          <>
            {/* Featured Story */}
            {featured && (
              <section className="mb-20">
                <div className="text-center mb-8">
                  <span className="inline-block px-4 py-1 rounded-full text-xs tracking-[0.2em] uppercase mb-4
                    bg-gradient-to-r from-[--gold-dark]/30 to-[--gold-mid]/30 
                    border border-[--gold-mid]/50 text-[--gold-light]">
                    ✨ This Week's Story ✨
                  </span>
                  <h2 className="text-3xl md:text-4xl text-[--text-primary]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Featured Tale
                  </h2>
                </div>

                <div className="card p-0 max-w-3xl mx-auto overflow-hidden">
                  <div className="story-image w-full h-48 md:h-64 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[--purple-darker]/90" />
                    <svg className="w-20 h-20 text-[--gold-mid] opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {featured.generatedBy === 'ai' && (
                      <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs bg-[--purple-mid]/80 text-[--purple-glow] border border-[--purple-light]/30">
                        AI Generated
                      </span>
                    )}
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-3xl font-semibold text-[--gold-light] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {featured.title}
                    </h3>
                    
                    {featured.description && (
                      <p className="text-[--text-secondary] text-lg mb-6 leading-relaxed" style={{ fontFamily: "'Spectral', serif" }}>
                        {featured.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-[--text-muted] mb-8">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[--purple-bright]" />
                        {featured._count.scenes} scenes
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[--gold-mid]" />
                        {featured._count.characters} characters
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[--teal-glow]" />
                        {featured._count.readerSessions} readers
                      </span>
                      {featured.theme && (
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[--pink-glow]" />
                          {featured.theme}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-4">
                      <Link href={`/play/${featured.id}`} className="btn btn-primary flex-1 text-center text-lg" style={{ opacity: 1, color: '#12081f' }}>
                        ▶ Begin Your Journey
                      </Link>
                      <Link href={`/analytics/${featured.id}`} className="btn btn-secondary px-6 flex items-center justify-center" style={{ opacity: 1 }} title="View Analytics">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Archived Stories */}
            {archived.length > 0 && (
              <section>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    <span className="text-[--text-primary]">From the </span>
                    <span className="text-gradient">Archives</span>
                  </h2>
                  <p className="text-[--text-muted]" style={{ fontFamily: "'Spectral', serif" }}>
                    Past tales, still waiting to be explored
                  </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {archived.map((story, index) => (
                    <article key={story.id} className="card p-0 group">
                      <div className="story-image w-full h-40 flex items-center justify-center relative">
                        <svg className="w-16 h-16 text-[--purple-glow] opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        {story.generatedBy === 'ai' && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs bg-[--purple-mid]/80 text-[--purple-glow] border border-[--purple-light]/30">
                            AI
                          </span>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-2xl font-semibold text-[--gold-light] mb-3 group-hover:text-[--gold-bright] transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          {story.title}
                        </h3>
                        
                        {story.description && (
                          <p className="text-[--text-secondary] mb-5 line-clamp-2 leading-relaxed" style={{ fontFamily: "'Spectral', serif" }}>
                            {story.description}
                          </p>
                        )}
                        
                        <div className="flex gap-4 text-sm text-[--text-muted] mb-6">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[--purple-bright]" />
                            {story._count.scenes} scenes
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[--teal-glow]" />
                            {story._count.readerSessions} readers
                          </span>
                        </div>
                        
                        <div className="flex gap-3">
                          <Link href={`/play/${story.id}`} className="btn btn-primary flex-1 text-center" style={{ opacity: 1, color: '#12081f' }}>
                            ▶ Begin
                          </Link>
                          <Link href={`/analytics/${story.id}`} className="btn btn-secondary px-4 flex items-center justify-center" style={{ opacity: 1 }} title="View Analytics">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* No stories state */}
            {!featured && archived.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-[--text-muted] text-lg" style={{ fontFamily: "'Spectral', serif" }}>
                  No stories available yet.
                </p>
                <p className="text-[--text-muted]">The first tale will appear soon...</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-[--purple-mid]/50 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="text-3xl">✦</span>
              <div>
                <p className="text-[--gold-mid] text-xl tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Echoes
                </p>
                <p className="text-[--text-muted] text-sm">Where stories come alive</p>
              </div>
            </div>
            <p className="text-[--text-muted] text-sm">
              Built with 
              <span className="text-[--purple-bright]"> Next.js</span>, 
              <span className="text-[--gold-mid]"> Prisma</span>, 
              <span className="text-[--teal-glow]"> Neon</span>, and
              <span className="text-[--pink-glow]"> Claude AI</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}