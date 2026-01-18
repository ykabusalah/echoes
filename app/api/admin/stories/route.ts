import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${process.env.ADMIN_SECRET}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stories = await prisma.story.findMany({
      include: {
        scenes: { select: { id: true } },
        _count: { select: { readerSessions: true } }
      },
      orderBy: [
        { status: 'asc' },
        { releaseAt: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    const now = new Date()

    const formattedStories = stories.map(story => {
      return {
        id: story.id,
        title: story.title,
        description: story.description,
        theme: story.theme,
        tier: story.tier,
        status: story.status,
        releaseAt: story.releaseAt,
        featuredAt: story.featuredAt,
        createdAt: story.createdAt,
        sceneCount: story.scenes.length,
        sessionCount: story._count.readerSessions,
        isReleased: story.status === 'ACTIVE' || story.status === 'FEATURED',
        isFeatured: story.status === 'FEATURED'
      }
    })

    const grouped = {
      featured: formattedStories.filter(s => s.status === 'FEATURED'),
      active: formattedStories.filter(s => s.status === 'ACTIVE'),
      scheduled: formattedStories.filter(s => s.status === 'ACTIVE' && s.releaseAt && new Date(s.releaseAt) > now),
      drafts: formattedStories.filter(s => s.status === 'DRAFT'),
      archived: formattedStories.filter(s => s.status === 'ARCHIVED')
    }

    return NextResponse.json({
      stories: formattedStories,
      grouped,
      counts: {
        total: formattedStories.length,
        featured: grouped.featured.length,
        active: grouped.active.length,
        scheduled: grouped.scheduled.length,
        drafts: grouped.drafts.length,
        archived: grouped.archived.length
      }
    })

  } catch (error) {
    console.error('Admin stories fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { storyId, action, releaseAt } = body

    if (!storyId) {
      return NextResponse.json({ error: 'storyId required' }, { status: 400 })
    }

    const story = await prisma.story.findUnique({ where: { id: storyId } })
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    let updateData: Record<string, unknown> = {}

    switch (action) {
      case 'activate':
        updateData = { status: 'ACTIVE' }
        if (!story.releaseAt) {
          updateData.releaseAt = new Date()
        }
        break

      case 'deactivate':
        updateData = { status: 'DRAFT' }
        break

      case 'feature':
        await prisma.story.updateMany({
          where: { status: 'FEATURED' },
          data: { status: 'ACTIVE' }
        })
        updateData = { status: 'FEATURED', featuredAt: new Date() }
        if (!story.releaseAt) {
          updateData.releaseAt = new Date()
        }
        break

      case 'unfeature':
        updateData = { status: 'ACTIVE' }
        break

      case 'archive':
        updateData = { status: 'ARCHIVED' }
        break

      case 'unarchive':
        updateData = { status: 'DRAFT' }
        break

      case 'schedule':
        if (!releaseAt) {
          return NextResponse.json({ error: 'releaseAt required for scheduling' }, { status: 400 })
        }
        updateData = { releaseAt: new Date(releaseAt), status: 'ACTIVE' }
        break

      case 'set_tier':
        const { tier } = body
        if (tier === undefined || tier < 1 || tier > 3) {
          return NextResponse.json({ error: 'tier must be 1, 2, or 3' }, { status: 400 })
        }
        updateData = { tier }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updated = await prisma.story.update({
      where: { id: storyId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      story: {
        id: updated.id,
        title: updated.title,
        status: updated.status,
        releaseAt: updated.releaseAt,
        tier: updated.tier
      }
    })

  } catch (error) {
    console.error('Admin story update error:', error)
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 })
  }
}