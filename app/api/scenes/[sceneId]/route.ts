import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const { sceneId } = await params

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

  return NextResponse.json(scene)
}