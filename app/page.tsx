'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from './components/ThemeToggle'

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

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  )
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L13.09 8.26L22 9.27L14 14.14L15.18 21.02L12 17.77L8.82 21.02L10 14.14L2 9.27L10.91 8.26L12 2Z" />
    </svg>
  )
}

export default function Home() {
  const [data, setData] = useState<StoriesResponse | null>(null)
  const [loading, setLoading] = useState(true)

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
    <div className="min-h-screen">
      {/* Nav Bar */}
      <nav className="border-b border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <SparkleIcon className="w-5 h-5 text-[hsl(var(--brand))]" />
            Echoes
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <header className="border-b border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="mb-6">
            <span className="badge badge-brand">
              <SparkleIcon className="w-3 h-3" />
              Interactive Fiction
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
            Echoes
          </h1>
          
          <p className="text-lg md:text-xl text-[hsl(var(--secondary-foreground))] max-w-xl mb-8">
            AI-generated branching narratives where every choice shapes your story. 
            See how your decisions compare to other readers.
          </p>

          <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-8">
            ✦ A new story appears every Monday
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Link href="/quiz" className="btn btn-primary">
              Discover Your Archetype
            </Link>
            <a href="#stories" className="btn btn-secondary">
              Browse Stories
              <ArrowDownIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Stories Section */}
      <main id="stories" className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="spinner" />
            <p className="text-sm text-[hsl(var(--secondary-foreground))]">
              Loading stories...
            </p>
          </div>
        ) : (
          <>
            {featured && (
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-lg font-medium">This Week's Story</h2>
                  <span className="badge badge-success">Featured</span>
                </div>

                <div className="card overflow-hidden">
                  <div className="story-image h-48 md:h-56">
                    <BookIcon className="w-16 h-16 text-[hsl(var(--secondary-foreground))] opacity-40" />
                    {featured.generatedBy === 'ai' && (
                      <span className="badge absolute top-4 right-4">
                        AI Generated
                      </span>
                    )}
                  </div>
                  
                  <div className="card-content">
                    <h3 className="text-2xl font-semibold mb-3">
                      {featured.title}
                    </h3>
                    
                    {featured.description && (
                      <p className="text-[hsl(var(--secondary-foreground))] mb-6 leading-relaxed">
                        {featured.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-[hsl(var(--secondary-foreground))] mb-6">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[hsl(var(--brand))]" />
                        {featured._count.scenes} scenes
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[hsl(var(--gold))]" />
                        {featured._count.characters} characters
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
                        {featured._count.readerSessions} readers
                      </span>
                      {featured.theme && (
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[hsl(var(--info))]" />
                          {featured.theme}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <Link href={`/play/${featured.id}`} className="btn btn-brand flex-1">
                        <PlayIcon className="w-4 h-4" />
                        Begin Story
                      </Link>
                      <Link href={`/analytics/${featured.id}`} className="btn btn-secondary" title="View Analytics">
                        <ChartIcon className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {archived.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium">Past Stories</h2>
                  <span className="text-sm text-[hsl(var(--secondary-foreground))]">
                    {archived.length} available
                  </span>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {archived.map((story, index) => (
                    <article 
                      key={story.id} 
                      className="card overflow-hidden animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
                    >
                      <div className="story-image h-32">
                        <BookIcon className="w-12 h-12 text-[hsl(var(--secondary-foreground))] opacity-30" />
                        {story.generatedBy === 'ai' && (
                          <span className="badge absolute top-3 right-3 text-xs">
                            AI
                          </span>
                        )}
                      </div>
                      
                      <div className="card-content">
                        <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                          {story.title}
                        </h3>
                        
                        {story.description && (
                          <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-4 line-clamp-2">
                            {story.description}
                          </p>
                        )}
                        
                        <div className="flex gap-4 text-xs text-[hsl(var(--secondary-foreground))] mb-4">
                          <span>{story._count.scenes} scenes</span>
                          <span>•</span>
                          <span>{story._count.readerSessions} readers</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link href={`/play/${story.id}`} className="btn btn-primary flex-1 text-sm">
                            <PlayIcon className="w-4 h-4" />
                            Play
                          </Link>
                          <Link href={`/analytics/${story.id}`} className="btn btn-secondary text-sm" title="Analytics">
                            <ChartIcon className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {!featured && archived.length === 0 && (
              <div className="card">
                <div className="card-content text-center py-16">
                  <BookIcon className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--secondary-foreground))] opacity-40" />
                  <p className="text-lg font-medium mb-2">No stories yet</p>
                  <p className="text-sm text-[hsl(var(--secondary-foreground))]">
                    The first tale will appear soon...
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] mt-12">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <SparkleIcon className="w-5 h-5 text-[hsl(var(--brand))]" />
              <div>
                <p className="font-medium">Echoes</p>
                <p className="text-xs text-[hsl(var(--secondary-foreground))]">
                  Interactive storytelling
                </p>
              </div>
            </div>
            <p className="text-xs text-[hsl(var(--secondary-foreground))]">
              Built with Next.js, Prisma, Neon & Claude AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}