'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Story {
  id: string
  title: string
  description: string
  theme: string
  status: string
  releaseAt: string | null
  featuredAt: string | null
  createdAt: string
  sceneCount: number
  sessionCount: number
  isReleased: boolean
  isFeatured: boolean
}

interface StoryData {
  stories: Story[]
  grouped: {
    featured: Story[]
    active: Story[]
    scheduled: Story[]
    drafts: Story[]
    archived: Story[]
  }
  counts: {
    total: number
    featured: number
    active: number
    scheduled: number
    drafts: number
    archived: number
  }
}

type FilterOption = 'all' | 'featured' | 'active' | 'draft' | 'archived'

export default function StoriesAdminPage() {
  const [data, setData] = useState<StoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [scheduleModal, setScheduleModal] = useState<Story | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [filter, setFilter] = useState<FilterOption>('all')

  const getAuthHeader = () => {
    const secret = sessionStorage.getItem('admin_token')
    return { Authorization: `Bearer ${secret}` }
  }

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/admin/stories', {
        headers: getAuthHeader()
      })
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/dashboard'
          return
        }
        throw new Error('Failed to fetch')
      }
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError('Failed to load stories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [])

  const handleAction = async (storyId: string, action: string, extra?: any) => {
    setActionLoading(storyId)
    try {
      const res = await fetch('/api/admin/stories', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ storyId, action, ...extra })
      })
      if (!res.ok) throw new Error('Action failed')
      await fetchStories()
    } catch (err) {
      alert('Action failed')
    } finally {
      setActionLoading(null)
      setScheduleModal(null)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Not set'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const statusColors: Record<string, string> = {
    FEATURED: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    ACTIVE: 'bg-green-500/20 text-green-300 border-green-500/50',
    SCHEDULED: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    DRAFT: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
    ARCHIVED: 'bg-red-500/20 text-red-300 border-red-500/50'
  }

  const getFilteredStories = (): Story[] => {
    if (!data) return []
    switch (filter) {
      case 'featured':
        return data.grouped.featured
      case 'active':
        return data.grouped.active
      case 'draft':
        return data.grouped.drafts
      case 'archived':
        return data.grouped.archived
      default:
        return data.stories
    }
  }

  const getFilterLabel = (f: FilterOption): string => {
    if (!data) return ''
    switch (f) {
      case 'all':
        return `All Stories (${data.counts.total})`
      case 'featured':
        return `Featured (${data.counts.featured})`
      case 'active':
        return `Active (${data.counts.active})`
      case 'draft':
        return `Drafts (${data.counts.drafts})`
      case 'archived':
        return `Archived (${data.counts.archived})`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-[hsl(var(--foreground))]">Loading stories...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-red-400">{error || 'Failed to load'}</p>
        </div>
      </div>
    )
  }

  const StoryCard = ({ story }: { story: Story }) => (
    <div className="border border-[hsl(var(--border))] rounded-lg p-4 bg-[hsl(var(--background))]">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-[hsl(var(--foreground))]">{story.title}</h3>
          <p className="text-sm text-[hsl(var(--secondary-foreground))] mt-1">{story.description}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded border ${statusColors[story.status]}`}>
          {story.status}
        </span>
      </div>

      <div className="text-xs text-[hsl(var(--secondary-foreground))] mb-3">
        {story.sceneCount} scenes · {story.sessionCount} sessions
        {story.releaseAt && story.status === 'SCHEDULED' && (
          <> · Releases {formatDate(story.releaseAt)}</>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {story.status === 'DRAFT' && (
          <>
            <button
              onClick={() => handleAction(story.id, 'activate')}
              disabled={actionLoading === story.id}
              className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
            >
              Activate
            </button>
            <button
              onClick={() => {
                setScheduleModal(story)
                setScheduleDate('')
              }}
              disabled={actionLoading === story.id}
              className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
            >
              Schedule
            </button>
          </>
        )}

        {story.status === 'ACTIVE' && (
          <>
            <button
              onClick={() => handleAction(story.id, 'feature')}
              disabled={actionLoading === story.id}
              className="text-xs px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded disabled:opacity-50"
            >
              ★ Feature
            </button>
            <button
              onClick={() => handleAction(story.id, 'deactivate')}
              disabled={actionLoading === story.id}
              className="text-xs px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50"
            >
              Move to Draft
            </button>
          </>
        )}

        {story.isFeatured && (
          <button
            onClick={() => handleAction(story.id, 'unfeature')}
            disabled={actionLoading === story.id}
            className="text-xs px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Remove Feature
          </button>
        )}

        {story.status !== 'ARCHIVED' && (
          <button
            onClick={() => handleAction(story.id, 'archive')}
            disabled={actionLoading === story.id}
            className="text-xs px-3 py-1.5 bg-red-600/50 hover:bg-red-700 text-white rounded disabled:opacity-50"
          >
            Archive
          </button>
        )}

        {story.status === 'ARCHIVED' && (
          <button
            onClick={() => handleAction(story.id, 'unarchive')}
            disabled={actionLoading === story.id}
            className="text-xs px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Restore
          </button>
        )}
      </div>
    </div>
  )

  const filteredStories = getFilteredStories()

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">◈ Story Management</h1>
            <p className="text-[hsl(var(--secondary-foreground))]">
              {data.counts.total} total · {data.counts.active + data.counts.featured} visible · {data.counts.drafts} drafts
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-[hsl(var(--brand))] hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Filter Dropdown */}
        <div className="mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterOption)}
            className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--brand))]"
          >
            <option value="all">{getFilterLabel('all')}</option>
            <option value="featured">{getFilterLabel('featured')}</option>
            <option value="active">{getFilterLabel('active')}</option>
            <option value="draft">{getFilterLabel('draft')}</option>
            <option value="archived">{getFilterLabel('archived')}</option>
          </select>
        </div>

        {/* Stories List */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-12 border border-[hsl(var(--border))] rounded-lg">
            <p className="text-[hsl(var(--secondary-foreground))]">
              {filter === 'all' ? 'No stories yet.' : `No ${filter} stories.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}

        {/* Schedule Modal */}
        {scheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
                Schedule Release: {scheduleModal.title}
              </h3>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full p-2 border border-[hsl(var(--border))] rounded bg-[hsl(var(--background))] text-[hsl(var(--foreground))] mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setScheduleModal(null)}
                  className="px-4 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))] rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction(scheduleModal.id, 'schedule', { releaseAt: scheduleDate })}
                  disabled={!scheduleDate || actionLoading === scheduleModal.id}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}