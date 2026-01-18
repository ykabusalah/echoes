import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const now = new Date()

    // Get featured story (only one)
    const featuredStory = await prisma.story.findFirst({
      where: {
        status: 'FEATURED'
      },
      include: {
        scenes: { select: { id: true } },
        _count: { select: { readerSessions: true } }
      }
    })

    // Get all visible stories (ACTIVE or FEATURED only)
    // Also respects releaseAt for scheduled releases
    const stories = await prisma.story.findMany({
      where: {
        status: { in: ['ACTIVE', 'FEATURED'] },
        OR: [
          { releaseAt: null },
          { releaseAt: { lte: now } }
        ]
      },
      include: {
        scenes: { select: { id: true } },
        _count: { select: { readerSessions: true } }
      },
      orderBy: [
        { status: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Format response
    const formattedStories = stories.map(story => ({
      id: story.id,
      title: story.title,
      description: story.description,
      theme: story.theme,
      tier: story.tier,
      status: story.status,
      sceneCount: story.scenes.length,
      sessionCount: story._count.readerSessions,
      isFeatured: story.status === 'FEATURED'
    }))

    return NextResponse.json({
      featured: featuredStory ? {
        id: featuredStory.id,
        title: featuredStory.title,
        description: featuredStory.description,
        theme: featuredStory.theme,
        tier: featuredStory.tier,
        sceneCount: featuredStory.scenes.length,
        sessionCount: featuredStory._count.readerSessions
      } : null,
      stories: formattedStories
    })

  } catch (error) {
    console.error('Stories fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}