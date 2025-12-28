import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      characters: true,
      scenes: {
        where: { isStart: true },
        include: {
          character: true,
          choicesFrom: {
            include: {
              toScene: true
            },
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  })

  if (!story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  }

  return NextResponse.json(story)
}