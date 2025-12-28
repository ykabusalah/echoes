import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { storyId, visitorId, choiceId, sceneId, isEnding } = body

  // Get or create session
  let session = await prisma.readerSession.findFirst({
    where: {
      storyId,
      visitorId,
      completedAt: null
    },
    orderBy: { startedAt: 'desc' }
  })

  if (!session) {
    session = await prisma.readerSession.create({
      data: {
        storyId,
        visitorId,
        currentSceneId: sceneId
      }
    })
  }

  // Log the choice if one was made
  if (choiceId) {
    await prisma.choiceEvent.create({
      data: {
        sessionId: session.id,
        choiceId
      }
    })

    // Update current scene
    await prisma.readerSession.update({
      where: { id: session.id },
      data: { currentSceneId: sceneId }
    })
  }

  // Mark session complete if ending reached
  if (isEnding) {
    await prisma.readerSession.update({
      where: { id: session.id },
      data: { completedAt: new Date() }
    })
  }

  return NextResponse.json({ sessionId: session.id })
}