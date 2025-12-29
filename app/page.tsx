'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Story = {
  id: string
  title: string
  description: string | null
  coverImage: string | null
  createdAt: string
  _count: {
    scenes: number
    characters: number
  }
}

function Sparkle({ style }: { style: React.CSSProperties }) {
  return <div className="sparkle" style={style} />
}

function FloatingOrb({ className, style }: { className: string; style: React.CSSProperties }) {
  return <div className={`orb ${className}`} style={style} />
}

export default function Home() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number }[]>([])

  useEffect(() => {
    // Generate random sparkles
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
        const data = await res.json()
        setStories(data)
      }
      setLoading(false)
    }
    fetchStories()
  }, [])

  return (
    <div className="min-h-screen relative">
      {/* Floating orbs */}
      <FloatingOrb 
        className="orb-purple animate-float-slow" 
        style={{ width: '400px', height: '400px', top: '5%', left: '10%', opacity: 0.4 }} 
      />
      <FloatingOrb 
        className="orb-gold animate-float" 
        style={{ width: '300px', height: '300px', top: '60%', right: '5%', opacity: 0.3, animationDelay: '2s' }} 
      />
      <FloatingOrb 
        className="orb-teal animate-float-slow" 
        style={{ width: '250px', height: '250px', bottom: '10%', left: '20%', opacity: 0.25, animationDelay: '4s' }} 
      />
      <FloatingOrb 
        className="orb-purple animate-float" 
        style={{ width: '200px', height: '200px', top: '30%', right: '15%', opacity: 0.35, animationDelay: '1s' }} 
      />

      {/* Sparkles */}
      {sparkles.map(s => (
        <Sparkle 
          key={s.id} 
          style={{ 
            left: `${s.x}%`, 
            top: `${s.y}%`, 
            animationDelay: `${s.delay}s` 
          }} 
        />
      ))}

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-36 text-center">
          {/* Decorative elements */}
          <div className="absolute top-10 left-1/4 w-2 h-2 bg-[--gold-bright] rounded-full animate-pulse-glow" />
          <div className="absolute top-20 right-1/3 w-3 h-3 bg-[--purple-bright] rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-[--teal-glow] rounded-full animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
          
          {/* Welcome badge */}
          <div className="mb-8 animate-fade-in-up">
            <span className="inline-block px-6 py-2 rounded-full text-sm tracking-[0.25em] uppercase
              bg-gradient-to-r from-[--purple-dark]/80 to-[--purple-mid]/80 
              border border-[--purple-light]/50 text-[--gold-light]
              shadow-lg shadow-purple-900/50">
              ✦ Welcome to ✦
            </span>
          </div>
          
          {/* Logo/Title */}
          <div className="mb-8 animate-fade-in-up stagger-1">
            <h1 className="text-7xl md:text-9xl font-semibold tracking-wide text-gradient drop-shadow-2xl" style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}>
              Echoes
            </h1>
            <div className="mt-4 flex justify-center gap-3">
              <span className="w-12 h-1 bg-gradient-to-r from-transparent via-[--gold-mid] to-transparent rounded-full" />
              <span className="w-3 h-3 bg-[--gold-mid] rounded-full animate-pulse" />
              <span className="w-12 h-1 bg-gradient-to-r from-transparent via-[--gold-mid] to-transparent rounded-full" />
            </div>
          </div>
          
          {/* Tagline */}
          <p className="text-2xl md:text-3xl text-[--text-secondary] max-w-2xl mx-auto mb-12 animate-fade-in-up stagger-2 leading-relaxed" style={{ fontFamily: "'Spectral', Georgia, serif", fontStyle: 'italic' }}>
            <span className="text-[--gold-light]">Every choice</span> ripples forward.
            <br />
            <span className="text-[--purple-glow]">Every story</span> remembers.
          </p>
          
          {/* CTA Button */}
          <div className="animate-fade-in-up stagger-3 mb-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quiz" className="btn btn-primary text-lg px-10 py-4 inline-flex items-center gap-3">
                <span>Discover Your Archetype</span>
                <span className="text-xl">✦</span>
              </Link>
              <a href="#stories" className="btn btn-secondary text-lg px-8 py-4 inline-flex items-center gap-3">
                <span>Browse Stories</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 md:gap-16 animate-fade-in-up stagger-4">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[--gold-light]">{stories.length}</p>
              <p className="text-sm text-[--text-muted] uppercase tracking-wide">Stories</p>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-[--purple-light] to-transparent" />
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[--purple-bright]">∞</p>
              <p className="text-sm text-[--text-muted] uppercase tracking-wide">Possibilities</p>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-[--purple-light] to-transparent" />
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[--teal-glow]">You</p>
              <p className="text-sm text-[--text-muted] uppercase tracking-wide">The Author</p>
            </div>
          </div>
        </div>
        
        {/* Decorative divider */}
        <div className="divider max-w-2xl mx-auto px-6 py-8">
          <svg className="w-8 h-8 text-[--gold-mid] animate-wiggle" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
      </header>

      {/* Stories Section */}
      <main id="stories" className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4">
            <span className="text-[--text-primary]">Choose Your </span>
            <span className="text-gradient">Tale</span>
          </h2>
          <p className="text-[--text-secondary] text-lg max-w-xl mx-auto">
            Each story branches into different fates. Your decisions shape the narrative.
            <span className="text-[--gold-mid]"> What will you choose?</span>
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[--purple-mid] border-t-[--gold-mid] rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-[--purple-bright] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-[--text-muted] animate-pulse">Summoning stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-[--text-muted] text-lg">No stories available yet.</p>
            <p className="text-[--text-muted]">Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story, index) => (
              <article
                key={story.id}
                className="card p-0 animate-fade-in-up group"
                style={{ animationDelay: `${index * 0.15}s`, opacity: 0 }}
              >
                {/* Story image */}
                <div className="story-image w-full h-40 flex items-center justify-center relative">
                  <svg className="w-16 h-16 text-[--purple-glow] opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-2xl font-semibold text-[--gold-light] mb-3 group-hover:text-[--gold-bright] transition-colors">
                    {story.title}
                  </h3>
                  
                  {/* Description */}
                  {story.description && (
                    <p className="text-[--text-secondary] mb-5 line-clamp-2 leading-relaxed">
                      {story.description}
                    </p>
                  )}
                  
                  {/* Stats */}
                  <div className="flex gap-6 text-sm text-[--text-muted] mb-6">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[--purple-bright]" />
                      {story._count.scenes} scenes
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[--gold-mid]" />
                      {story._count.characters} characters
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/play/${story.id}`}
                      className="btn btn-primary flex-1 text-center"
                    >
                      ▶ Begin
                    </Link>
                    <Link
                      href={`/analytics/${story.id}`}
                      className="btn btn-secondary px-4 flex items-center justify-center"
                      title="View Analytics"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-[--purple-mid]/50 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="text-3xl">✦</span>
              <div>
                <p className="text-[--gold-mid] font-[Cinzel] text-xl tracking-wide">Echoes</p>
                <p className="text-[--text-muted] text-sm">Where stories come alive</p>
              </div>
            </div>
            <p className="text-[--text-muted] text-sm">
              Built with 
              <span className="text-[--purple-bright]"> Next.js</span>, 
              <span className="text-[--gold-mid]"> Prisma</span>, and 
              <span className="text-[--teal-glow]"> Neon</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}