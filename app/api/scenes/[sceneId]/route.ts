import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const { sceneId } = await params
  const visitorId = request.nextUrl.searchParams.get('visitorId')

  // Get reader's archetype if visitorId provided
  let readerArchetype: string | null = null
  if (visitorId) {
    const profile = await prisma.readerProfile.findUnique({
      where: { visitorId }
    })
    readerArchetype = profile?.archetype || null
  }

  const scene = await prisma.scene.findUnique({
    where: { id: sceneId },
    include: {
      character: true,
      choicesFrom: {
        include: {
          toScene: true
        },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!scene) {
    return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
  }

  // Filter choices: show standard (null archetype) + matching archetype
  const filteredChoices = scene.choicesFrom.filter(choice => {
    if (!choice.archetypeTarget) return true // Standard choice, show to everyone
    if (readerArchetype && choice.archetypeTarget === readerArchetype) return true // Personalized match
    return false
  })

  return NextResponse.json({
    ...scene,
    choicesFrom: filteredChoices,
    isBranchPoint: (scene as any).isBranchPoint || false
  })
}