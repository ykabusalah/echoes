import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ choiceId: string }> }
) {
  const { choiceId } = await params

  // Get the choice to find its parent scene
  const choice = await prisma.choice.findUnique({
    where: { id: choiceId },
    include: { fromScene: true }
  })

  if (!choice) {
    return NextResponse.json({ error: 'Choice not found' }, { status: 404 })
  }

  // Get all choices from the same scene
  const allChoices = await prisma.choice.findMany({
    where: { fromSceneId: choice.fromSceneId },
    include: {
      _count: {
        select: { choiceEvents: true }
      }
    }
  })

  // Calculate total votes
  const totalVotes = allChoices.reduce((sum, c) => sum + c._count.choiceEvents, 0)

  // Build stats for each choice
  const stats = allChoices.map(c => ({
    id: c.id,
    text: c.text,
    count: c._count.choiceEvents,
    percentage: totalVotes > 0 ? Math.round((c._count.choiceEvents / totalVotes) * 100) : 0
  }))

  return NextResponse.json({
    totalVotes,
    chosenId: choiceId,
    stats
  })
}