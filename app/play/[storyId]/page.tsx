'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

type Character = {
  id: string
  name: string
  description: string | null
  avatarUrl: string | null
}

type Choice = {
  id: string
  text: string
  toSceneId: string
}

type Scene = {
  id: string
  title: string
  content: string
  isEnding: boolean
  character: Character | null
  choicesFrom: Choice[]
}

type Story = {
  id: string
  title: string
  description: string | null
  scenes: Scene[]
}

// Generate or retrieve a visitor ID
function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  let id = document.cookie
    .split('; ')
    .find(row => row.startsWith('visitorId='))
    ?.split('=')[1]
  if (!id) {
    id = crypto.randomUUID()
    document.cookie = `visitorId=${id}; max-age=31536000; path=/`
  }
  return id
}

export default function PlayStory() {
  const params = useParams()
  const storyId = params.storyId as string

  const [story, setStory] = useState<Story | null>(null)
  const [currentScene, setCurrentScene] = useState<Scene | null>(null)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<Scene[]>([])
  const [visitorId, setVisitorId] = useState<string>('')

  // Set visitor ID on mount
  useEffect(() => {
    setVisitorId(getVisitorId())
  }, [])

  // Fetch story and starting scene
  useEffect(() => {
    async function fetchStory() {
      const res = await fetch(`/api/stories/${storyId}`)
      if (res.ok) {
        const data = await res.json()
        setStory(data)
        if (data.scenes && data.scenes.length > 0) {
          const startScene = data.scenes[0]
          setCurrentScene(startScene)
          
          // Track session start
          if (visitorId) {
            fetch('/api/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                storyId,
                visitorId,
                sceneId: startScene.id,
                isEnding: startScene.isEnding
              })
            })
          }
        }
      }
      setLoading(false)
    }
    if (visitorId) fetchStory()
  }, [storyId, visitorId])

  // Handle choice selection
  async function handleChoice(choice: Choice) {
    setLoading(true)
    if (currentScene) {
      setHistory([...history, currentScene])
    }

    const res = await fetch(`/api/scenes/${choice.toSceneId}`)
    if (res.ok) {
      const scene = await res.json()
      setCurrentScene(scene)

      // Track the choice
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          visitorId,
          choiceId: choice.id,
          sceneId: scene.id,
          isEnding: scene.isEnding
        })
      })
    }
    setLoading(false)
  }

  // Restart story
  function handleRestart() {
    if (story && story.scenes.length > 0) {
      const startScene = story.scenes[0]
      setCurrentScene(startScene)
      setHistory([])

      // Track new session
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          visitorId,
          sceneId: startScene.id,
          isEnding: startScene.isEnding
        })
      })
    }
  }

  if (loading && !currentScene) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-stone-100">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  if (!story || !currentScene) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-stone-100">
        <p className="text-lg">Story not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Story title */}
        <h1 className="text-3xl font-bold text-center mb-8 text-amber-500">
          {story.title}
        </h1>

        {/* Scene card */}
        <div className="bg-stone-800 rounded-lg p-8 mb-6 shadow-xl">
          {/* Character name */}
          {currentScene.character && (
            <p className="text-amber-400 text-sm uppercase tracking-wide mb-2">
              {currentScene.character.name}
            </p>
          )}

          {/* Scene content */}
          <p className="text-lg leading-relaxed mb-8 whitespace-pre-line">
            {currentScene.content}
          </p>

          {/* Choices or ending */}
          {currentScene.isEnding ? (
            <div className="text-center">
              <p className="text-stone-400 italic mb-6">The End</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
                >
                  Start Over
                </button>
                <a
                  href="/"
                  className="px-6 py-3 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors"
                >
                  Back to Stories
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {currentScene.choicesFrom.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  disabled={loading}
                  className="w-full text-left px-5 py-4 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  {choice.text}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <p className="text-center text-stone-500 text-sm">
          Scene {history.length + 1}
        </p>
      </div>
    </div>
  )
}