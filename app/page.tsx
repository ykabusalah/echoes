'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from './components/ThemeToggle'
import { ArchetypeIcon, archetypeDescriptions, archetypeColors } from './components/ArchetypeIcons'

type Story = {
  id: string
  title: string
  description: string | null
  theme: string | null
  tier: number
  status: string
  sceneCount: number
  sessionCount: number
  isFeatured: boolean
}

type StoriesResponse = {
  featured: Story | null
  stories: Story[]
}

type UserProfile = {
  archetype: string
  scores: Record<string, number>
}

type RecommendedStory = {
  id: string
  title: string
  description: string
  theme: string
  sceneCount: number
  readers: number
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  let id = document.cookie.split('; ').find(row => row.startsWith('visitorId='))?.split('=')[1]
  if (!id) {
    id = crypto.randomUUID()
    document.cookie = `visitorId=${id}; max-age=31536000; path=/`
  }
  return id
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
  const router = useRouter()
  const [data, setData] = useState<StoriesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recommendedStory, setRecommendedStory] = useState<RecommendedStory | null>(null)

  useEffect(() => {
    async function checkProfile() {
      const visitorId = getVisitorId()
      if (!visitorId) {
        setCheckingProfile(false)
        return
      }

      try {
        const res = await fetch(`/api/quiz?visitorId=${visitorId}`)
        const data = await res.json()
        
        if (!data.hasProfile) {
          router.push('/quiz')
          return
        }
        
        setProfile(data.profile)
        
        const recRes = await fetch(`/api/stories/recommend?archetype=${data.profile.archetype}`)
        if (recRes.ok) {
          const recData = await recRes.json()
          setRecommendedStory(recData)
        }
      } catch (error) {
        console.error('Profile check failed:', error)
      }
      
      setCheckingProfile(false)
    }
    checkProfile()
  }, [router])

  useEffect(() => {
    async function fetchStories() {
      if (checkingProfile) return
      
      const visitorId = getVisitorId()
      const res = await fetch(`/api/stories?visitorId=${visitorId}`)
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
      setLoading(false)
    }
    fetchStories()
  }, [checkingProfile])

  const featured = data?.featured
  const stories = data?.stories?.filter(s => !s.isFeatured) || []

  if (checkingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="spinner" />
        <p className="text-sm text-[hsl(var(--secondary-foreground))]">
          Preparing your journey...
        </p>
      </div>
    )
  }

  const archetypeInfo = profile ? archetypeDescriptions[profile.archetype] : null
  const archetypeColor = profile ? archetypeColors[profile.archetype] : null

  return (
    <div className="min-h-screen">
      {/* Nav Bar */}
      <nav className="border-b border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <SparkleIcon className="w-5 h-5 text-[hsl(var(--brand))]" />
            Echoes
          </Link>
          <div className="flex items-center gap-4">
            {profile && (
              <Link 
                href={`/quiz/results?archetype=${profile.archetype}`}
                className="flex items-center gap-2 text-sm text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                <div className="w-5 h-5" style={{ color: archetypeColor || undefined }}>
                  <ArchetypeIcon archetype={profile.archetype} className="w-full h-full" />
                </div>
                <span className="hidden sm:inline">{archetypeInfo?.title}</span>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="border-b border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          {profile && archetypeInfo ? (
            <>
              <div className="mb-6">
                <span className="badge badge-brand">
                  <SparkleIcon className="w-3 h-3" />
                  Welcome back, {archetypeInfo.title}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
                Your Next Chapter Awaits
              </h1>
              
              <p className="text-lg md:text-xl text-[hsl(var(--secondary-foreground))] max-w-xl mb-8">
                {archetypeInfo.tagline}. Explore stories crafted for your archetype.
              </p>
            </>
          ) : (
            <>
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
            </>
          )}

          <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-8">
            ✦ A new story appears every Monday
          </p>
          
          <div className="flex flex-wrap gap-3">
            {recommendedStory ? (
              <Link href={`/play/${recommendedStory.id}`} className="btn btn-primary">
                <PlayIcon className="w-4 h-4" />
                Play Recommended Story
              </Link>
            ) : (
              <Link href="/quiz" className="btn btn-primary">
                Discover Your Archetype
              </Link>
            )}
            <a href="#stories" className="btn btn-secondary">
              Browse Stories
              <ArrowDownIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Recommended For You Section */}
      {profile && recommendedStory && (
        <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--accent))]">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6" style={{ color: archetypeColor || undefined }}>
                <ArchetypeIcon archetype={profile.archetype} className="w-full h-full" />
              </div>
              <h2 className="text-lg font-medium">Recommended for {archetypeInfo?.title}</h2>
            </div>
            
            <div className="card overflow-hidden">
              <div className="card-content flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{recommendedStory.title}</h3>
                  <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-2">
                    {recommendedStory.description}
                  </p>
                  <div className="flex gap-4 text-xs text-[hsl(var(--secondary-foreground))]">
                    <span>{recommendedStory.sceneCount} scenes</span>
                    <span>•</span>
                    <span>{recommendedStory.readers} readers</span>
                  </div>
                </div>
                <Link href={`/play/${recommendedStory.id}`} className="btn btn-brand shrink-0">
                  <PlayIcon className="w-4 h-4" />
                  Begin Story
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

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
                        {featured.sceneCount} scenes
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
                        {featured.sessionCount} readers
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

            {stories.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium">All Stories</h2>
                  <span className="text-sm text-[hsl(var(--secondary-foreground))]">
                    {stories.length} available
                  </span>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {stories.map((story, index) => (
                    <article 
                      key={story.id} 
                      className="card overflow-hidden animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
                    >
                      <div className="story-image h-32">
                        <BookIcon className="w-12 h-12 text-[hsl(var(--secondary-foreground))] opacity-30" />
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
                          <span>{story.sceneCount} scenes</span>
                          <span>•</span>
                          <span>{story.sessionCount} readers</span>
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

            {!featured && stories.length === 0 && (
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
            <div className="flex items-center gap-4">
              {profile && (
                <Link href="/quiz?retake=true">Retake Quiz</Link>
              )}
              <p className="text-xs text-[hsl(var(--secondary-foreground))]">
                Built with Next.js, Prisma, Neon & Claude AI
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}