import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Map archetypes to themes they'd enjoy
const ARCHETYPE_THEMES: Record<string, string[]> = {
  wanderer: ['spirituality', 'surreal', 'mystery', 'survival'],
  guardian: ['family', 'survival', 'family legacy', 'moral drama'],
  seeker: ['mystery', 'noir', 'thriller', 'corporate'],
  flame: ['heist', 'thriller', 'survival', 'crime drama'],
  dreamer: ['magical realism', 'surreal', 'spirituality', 'relationship drama'],
  shadow: ['noir', 'horror', 'thriller', 'corporate']
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const archetype = searchParams.get('archetype')?.toLowerCase()

    if (!archetype) {
      return NextResponse.json({ error: 'archetype required' }, { status: 400 })
    }

    const preferredThemes = ARCHETYPE_THEMES[archetype] || []
    const now = new Date()

    // Try to find a story matching their preferred themes
    let story = await prisma.story.findFirst({
      where: {
        status: { in: ['ACTIVE', 'FEATURED'] },
        theme: { in: preferredThemes },
        OR: [
          { releaseAt: null },
          { releaseAt: { lte: now } }
        ]
      },
      include: {
        scenes: { select: { id: true } },
        _count: { select: { readerSessions: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // If no theme match, just get any active story
    if (!story) {
      story = await prisma.story.findFirst({
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
        orderBy: { createdAt: 'desc' }
      })
    }

    if (!story) {
      return NextResponse.json({ error: 'No stories available' }, { status: 404 })
    }

    return NextResponse.json({
      id: story.id,
      title: story.title,
      description: story.description,
      theme: story.theme,
      sceneCount: story.scenes.length,
      readers: story._count.readerSessions
    })

  } catch (error) {
    console.error('Recommend story error:', error)
    return NextResponse.json({ error: 'Failed to get recommendation' }, { status: 500 })
  }
}