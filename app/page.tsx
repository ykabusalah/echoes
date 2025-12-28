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

export default function Home() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

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
    <div className="min-h-screen bg-stone-900 text-stone-100">
      {/* Header */}
      <header className="border-b border-stone-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-amber-500 mb-2">Echoes</h1>
          <p className="text-stone-400">
            Interactive stories where your choices shape the narrative.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-8">Stories</h2>

        {loading ? (
          <p className="text-stone-500">Loading stories...</p>
        ) : stories.length === 0 ? (
          <p className="text-stone-500">No stories available yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-stone-800 rounded-lg p-6 hover:ring-1 hover:ring-amber-500/50 transition-all"
              >
                <h3 className="text-xl font-semibold text-amber-400 mb-2">
                  {story.title}
                </h3>
                {story.description && (
                  <p className="text-stone-300 text-sm mb-4 line-clamp-2">
                    {story.description}
                  </p>
                )}
                <div className="flex gap-4 text-xs text-stone-500 mb-4">
                  <span>{story._count.scenes} scenes</span>
                  <span>{story._count.characters} characters</span>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/play/${story.id}`}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded text-sm transition-colors"
                  >
                    Play
                  </Link>
                  <Link
                    href={`/analytics/${story.id}`}
                    className="px-4 py-2 bg-stone-700 hover:bg-stone-600 rounded text-sm transition-colors"
                  >
                    Analytics
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-stone-500 text-sm">
          Built with Next.js, Prisma, and Neon
        </div>
      </footer>
    </div>
  )
}