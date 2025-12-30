import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const archetype = request.nextUrl.searchParams.get('archetype')

  if (!archetype) {
    return NextResponse.json({ error: 'Archetype required' }, { status: 400 })
  }

  try {
    // Find stories that match the archetype theme
    // First try exact match, then get any story as fallback
    let story = await prisma.story.findFirst({
      where: {
        theme: archetype.toLowerCase(),
        published: true
      },
      include: {
        _count: {
          select: {
            scenes: true,
            readerSessions: true
          }
        }
      }
    })

    // Fallback to any published story if no match
    if (!story) {
      story = await prisma.story.findFirst({
        where: { published: true },
        include: {
          _count: {
            select: {
              scenes: true,
              readerSessions: true
            }
          }
        }
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
      sceneCount: story._count.scenes,
      readers: story._count.readerSessions
    })
  } catch (error) {
    console.error('Recommend story error:', error)
    return NextResponse.json({ error: 'Failed to get recommendation' }, { status: 500 })
  }
}