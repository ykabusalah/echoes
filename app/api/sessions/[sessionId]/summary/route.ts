import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params

  // Get the session with all choice events
  const session = await prisma.readerSession.findUnique({
    where: { id: sessionId },
    include: {
      story: true,
      currentScene: true,
      choiceEvents: {
        include: {
          choice: {
            include: {
              fromScene: true
            }
          }
        },
        orderBy: { chosenAt: 'asc' }
      }
    }
  })

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // For each choice made, get the stats
  const choicesWithStats = await Promise.all(
    session.choiceEvents.map(async (event) => {
      const allChoices = await prisma.choice.findMany({
        where: { fromSceneId: event.choice.fromSceneId },
        include: {
          _count: { select: { choiceEvents: true } }
        }
      })

      const totalVotes = allChoices.reduce((sum, c) => sum + c._count.choiceEvents, 0)
      const yourChoice = allChoices.find(c => c.id === event.choiceId)
      const yourPercentage = yourChoice && totalVotes > 0 
        ? Math.round((yourChoice._count.choiceEvents / totalVotes) * 100) 
        : 0

      return {
        sceneTitle: event.choice.fromScene.title,
        choiceText: event.choice.text,
        percentage: yourPercentage,
        totalVotes
      }
    })
  )

  // Get ending stats
  const endingStats = await prisma.readerSession.groupBy({
    by: ['currentSceneId'],
    where: {
      storyId: session.storyId,
      completedAt: { not: null }
    },
    _count: true
  })

  const totalCompletions = endingStats.reduce((sum, e) => sum + e._count, 0)
  const yourEnding = endingStats.find(e => e.currentSceneId === session.currentSceneId)
  const endingPercentage = yourEnding && totalCompletions > 0
    ? Math.round((yourEnding._count / totalCompletions) * 100)
    : 0

  return NextResponse.json({
    storyTitle: session.story.title,
    endingTitle: session.currentScene?.title || 'Unknown Ending',
    endingPercentage,
    totalCompletions,
    choices: choicesWithStats
  })
}
